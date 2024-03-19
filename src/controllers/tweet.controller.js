import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if(content?.trim() === "") {
        throw new apiError(400, "Tweet is required")
    }

    const tweet = await Tweet.create({
        owner: req.user._id,
        content
    })

    if(!tweet) {
        throw new apiError(500, "Something went wrong while creating tweet")
    }

    return res.status(201).json(
        new apiResponse(200, tweet._id, "Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const tweets = await Tweet.find({owner: req.user._id});

    if (!tweets) {
        throw new apiError(404, "Tweets not found");
    }

    return res.status(200).json(new apiResponse(200, tweets, "Tweets fectched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new apiError(400, "Invalid tweet ID");
    }

    if(content?.trim() === "") {
        throw new apiError(400, "Tweet is required")
    }

    const tweetExists = await Tweet.findById(tweetId);
    if (!tweetExists) {
        throw new apiError(404, "Tweet not found");
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId,
    {
        $set: {
            content
        }
    },
    {new: true}
    )

    if(!tweet) {
        return res.status(200).json(new apiError(200, "Something went wrong while updating tweet"))
    }

    return res.status(200).json(new apiResponse(200, tweet, "Tweet updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new apiError(400, "Invalid Tweet ID");
    }

    const tweet = await Tweet.deleteOne(new mongoose.Types.ObjectId(tweetId));

    if (tweet.deletedCount === 1) {
        return res.status(200).json(new apiResponse(200, tweet.deletedCount, "Tweet deleted successfully"))
    } else {
        throw new apiError(500, "Something went wrong while performing delete operation")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}