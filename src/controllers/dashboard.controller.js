import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user?._id

    if(!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid User ID");
    }

    const videoStats = await Video.aggregate([
        {
            //match all the videos in collection for this current user
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        }, 
        {
            //look up in comments where the current users video._id matches with comment.video field
            $lookup: {
                from: "comments",
                localField: "_id", //video._id
                foreignField: "video", //comment.video
                as: "totalComments"
            }    
        },
        {
            //look up in likes where the current users video._id matches with likes.video field
            $lookup: {
                from: "likes",
                localField: "_id", //video._id
                foreignField: "video", //likes.video
                as: "totalLikes"
            }    
        },
        {
            //group all the values
            $group: { 
                _id: null,
                TotalVideosCount: { $sum: 1 },
                TotalViewsOnVideos: { $sum: "$views" },
                TotalCommentsOnVideos: { $sum: { $size: "$totalComments" } },
                TotalLikesOnVideos: { $sum: { $size: "$totalLikes" } }
            }
        }
    ])
    
    const SubscriptionStats = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $group: {
                _id: null,
                TotalSubscribersCount: { $sum: 1 }
            }
        }
    ])

    const groupedChannelStats = {
        ...videoStats[0],
        ...SubscriptionStats[0]
    }

    return res.status(200).json(groupedChannelStats)
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {page = 1, limit = 10} = req.query

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
        throw new apiError(400, "Invalid pagination parameters")
    }

    const userId = req.user?._id

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const total = await Video.countDocuments({owner: userId});

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id", //video._id
                foreignField: "video", //like.video
                as: "totalLikes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id", //video._id
                foreignField: "video", //like.video
                as: "totalComments"
            }
        },
        {
            $addFields: {
                totalLikes: {
                    $size: "$totalLikes"
                },
                totalComments: {
                    $size: "$totalComments"
                }
            }
        }
    ])     
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

    if (!videos?.length) {
        throw new apiError(404, "You haven't uploaded any video yet.")
    }

    return res.status(200).json(new apiResponse(200, videos, "Videos fetched successfully"))

    //return res.status(200).json({success: true, total, page, limit, videos });
})

export {
    getChannelStats, 
    getChannelVideos
    }