import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if([ title, description ].some((field) => { field?.trim() === ""})) {
        throw new apiError(400, "All fields are required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if( !videoFileLocalPath && !thumbnailLocalPath ) {
        throw new apiError(400, "Video and thumbnail file is required")
    }

    //Todo delete old files
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)


    if(!videoFile && !thumbnail) {
        throw new apiError(400, "Video and thumbnail file is required")
    }
    
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        duration: videoFile?.duration,
        owner: req.user._id
    })

    const createdVideo = await Video.findById(video._id).select( "-updatedAt")

    if(!createdVideo) {
        throw new apiError(500, "Something went wrong while uploading the video")
    }

    return res.status(201).json(
        new apiResponse(200, createdVideo, "Video uploaded successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if( !videoId ) {
        throw new apiError(400, "Vedio Id is required")
    }

    const video = await Video.findOne({_id: videoId})

    if( !video ) {
        throw new apiError(400, "Invalid video request")
    }

    return res.status(200).json(new apiResponse(200, video, "Video fectched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}