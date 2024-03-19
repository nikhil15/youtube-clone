import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid video ID")
    }

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
        throw new apiError(400, "Invalid pagination parameters")
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const total = await Comment.countDocuments({video: videoId});
    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit);
    
    return res.status(200).json({success: true, total, page, limit, comments });
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body
    const user = req.user._id

    if (!videoId || videoId.trim() === '') {
        throw new apiError(400, "Video ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid video ID")
    }

    if(!content) {
        throw new apiError(400, "Comment is required")
    }

    const comment = await Comment.create({
        content,
        video: new mongoose.Types.ObjectId(videoId),
        owner: new mongoose.Types.ObjectId(user) 
    })

    if(!comment) {
        throw new apiError(500, "Something went wrong while adding comment")
    }

    return res.status(201).json(
        new apiResponse(200, comment._id, "Comment has been added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content } = req.body

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new apiError(400, "Invalid comment ID")
    }

    if(!content) {
        throw new apiError(400, "Comment is required")
    }

    const comment = await Comment.findByIdAndUpdate(commentId,
        {
            $set: {
                content
            }
        },
        {new: true}
    )

    if(!comment) {
        return res.status(200).json(new apiError(200, "Something went wrong while updating comment"))
    }

    return res.status(200).json(new apiResponse(200, comment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new apiError(400, "Invalid comment ID")
    }

    const deleteComment = await Comment.deleteOne(new mongoose.Types.ObjectId(commentId));

    if (deleteComment.deletedCount === 1) {
        return res.status(200).json(new apiResponse(200, deleteComment.deletedCount, "Comment deleted successfully"))
    } else {
        throw new apiError(500, "Something went wrong while performing delete operation")
    }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}