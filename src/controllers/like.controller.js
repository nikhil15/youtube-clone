import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid video ID")
    }

    const alreadyExists = await Like.findOne({ video: videoId, likedBy: req.user._id });

    if (!alreadyExists) {

        const like = await Like.create({
            video: videoId,
            likedBy: req.user._id
        })

        if(!like) {
            throw new apiError(500, "Something went wrong while saving your like")
        }

        return res.status(201).json(
            new apiResponse(200, like._id, "Video has been liked")
        )
    } else {
        
        const deleteLike = await Like.deleteOne({ _id: alreadyExists._id })

        if(deleteLike.deletedCount === 1) {
            res.status(200).json(new apiResponse(200, deleteLike.deletedCount, "Video has been unliked"))
        } else {
            throw new apiError(500, "Something went wrong while performing unlike operation")
        }
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new apiError(400, "Invalid video ID")
    }

    const alreadyExists = await Like.findOne({ comment: commentId, likedBy: req.user._id });

    if (!alreadyExists) {

        const like = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })

        if(!like) {
            throw new apiError(500, "Something went wrong while saving your comment like")
        }

        return res.status(201).json(
            new apiResponse(200, like._id, "Comment has been liked")
        )
    } else {
        
        const deleteLike = await Like.deleteOne({ _id: alreadyExists._id })

        if(deleteLike.deletedCount === 1) {
            res.status(200).json(new apiResponse(200, deleteLike.deletedCount, "Comment has been unliked"))
        } else {
            throw new apiError(500, "Something went wrong while performing unlike operation")
        }
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new apiError(400, "Invalid video ID")
    }

    const alreadyExists = await Like.findOne({ tweet: tweetId, likedBy: req.user._id });

    if (!alreadyExists) {

        const like = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })

        if(!like) {
            throw new apiError(500, "Something went wrong while saving your tweet like")
        }

        return res.status(201).json(
            new apiResponse(200, like._id, "Tweet has been liked")
        )
    } else {
        
        const deleteLike = await Like.deleteOne({ _id: alreadyExists._id })

        if(deleteLike.deletedCount === 1) {
            res.status(200).json(new apiResponse(200, deleteLike.deletedCount, "Tweet has been unliked"))
        } else {
            throw new apiError(500, "Something went wrong while performing unlike operation")
        }
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const like = await Like.aggregate([
        {
          $match: {
            likedBy: new mongoose.Types.ObjectId(req.user._id),
             video: { $exists: true }
          }
        },
        {
          $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "likedVideos"
          } 
        },
        {
          $unwind: "$likedVideos"
        },
        {
          $addFields: {
            videoId: "$likedVideos._id",
            videoTitle: "$likedVideos.title",
            videoDescription: "$likedVideos.description",
            videoThumbnail: "$likedVideos.thumbnail",
            videoFile: "$likedVideos.videoFile"
          }
        },
        {
            $project: {
                videoId: 1,
                videoTitle: 1,
                videoDescription: 1,
                videoThumbnail: 1,
                videoFile: 1
            }
        }
      ])

    return res.status(200).json(like) 
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}