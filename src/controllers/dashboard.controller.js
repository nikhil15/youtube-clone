import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user?._id

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new apiError(400, "Invalid User ID")
    }

    const totalSubscribers  =  await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    return res.status(200).json({totalSubscribers})
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user?._id

    const {page = 1, limit = 10} = req.query

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new apiError(400, "Invalid channel ID")
    }

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
        throw new apiError(400, "Invalid pagination parameters")
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const total = await Video.countDocuments({owner: userId});
    const video = await Video.find({ owner: userId })
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit);
    
    return res.status(200).json({success: true, total, page, limit, video });
})

export {
    getChannelStats, 
    getChannelVideos
    }