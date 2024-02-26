import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {

    const {username, email, fullName, password } = req.body 

    if([fullName, email, username, password ].some((field) => { field?.trim() === ""})) {
        throw new apiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser) {
        throw new apiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) {
        throw new apiError(409, "Avtar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new apiError(409, "Avtar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select( "-password -refreshToken")

    if(!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user account")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler( async(req, res) => {

    const {username, email, password } = req.body

    if( !username && !email ) {
        throw new apiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!user) {
        throw new apiError(404, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new apiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiResponse(200, {accessToken, refreshToken}, "User logged in successfully"))
})

const logoutUser = asyncHandler(async(req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        }, 
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new apiError(401, "Invalid request token")
        }
    
        if(incomingRefreshToken  !== user?.refreshToken) {
            throw new apiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new apiResponse(200, {accessToken, newRefreshToken}, "Access token refreshed"))
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    
    const { oldPassword, newPassword } = req.body
    
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new apiError(400, "Incorrect old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave})
    
    return res.status(200).json(new apiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {

   return req.status(200).json(200, req.user, "Current user fetched successfully")

})

const updateAccountDetails = asyncHandler(async (req, res) => {
    
    const {fullName, email, } = req.body

    if(!fullName && !email) {
        throw new apiError(200, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set: {
            fullName,
            email
        }
    },
    {new: true}
    ).select("-password")

    return res.status(200).json(new apiResponse(200, user, "Account details updated successfully"))
})

const updateAvatar = asyncHandler(async (req, res) => {
    
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) {
        throw new apiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url) {
        throw new apiError(400, "Error while uploading file on avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set: {
            avatar: avatar.url
        }
    },
    {new: true}
    ).select("-password")

    return res.status(200).json(new apiResponse(200, user, "Avatar successfully updated"))
})

const updateCover = asyncHandler(async (req, res) => {
    
    const coverLocalPath = req.file?.path

    if(!coverLocalPath) {
        throw new apiError(400, "Cover file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverLocalPath)

    if(!coverImage.url) {
        throw new apiError(400, "Error while uploading file on cover file")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set: {
            coverImage: coverImage.url
        }
    },
    {new: true}
    ).select("-password")

    return res.status(200).json(new apiResponse(200, user, "Cover successfully updated"))
})

export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateAvatar, 
    updateCover 
}