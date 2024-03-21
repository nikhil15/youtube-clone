import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!isValidObjectId(channelId)) {
        throw new apiError(400, "Invalid channelId");
    }

    const isSubscribed = await Subscription.findOne({ subscriber: req.user._id, channel: channelId })

    if(isSubscribed) {
        await Subscription.findByIdAndDelete({subscriber: req.user._id})
        res.status(200).json(new apiResponse(200, { subscribed: false }, "Unsubscribed successfully"))
    }

    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
    })

    return res.status(200).json(new apiResponse(200, { subscribed: true }, "Subscribed successfully"));
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // get users who have subscribed to our channels.
    const {channelId} = req.params

    if(!isValidObjectId(channelId)) {
        throw new apiError(400, "Invalid channelId");
    }

    if (req.user?._id.toString() != channelId) {
        throw new apiError(400, "You are not the owner of this channel to get subscribers list")
    }

    const channelSubscribers = await Subscription.aggregate([  
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $facet: {
                subscribers: [
                    {   
                        $lookup: {
                            from: "users",
                            localField: "subscriber",
                            foreignField: "_id",
                            as: "subscriber",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                        createdAt: 1,
                                        updatedAt: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            subscriber: {
                                $first: "$subscriber"
                            }
                        }
                    }
                ],
                subscribersCount: [
                    { $count: "subscribers" }
                ]
            }
        } 
    ])

    return res.status(200).json(new apiResponse(200, channelSubscribers, "All subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
 

    
    return res.status(200).json(subscriberId)
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}