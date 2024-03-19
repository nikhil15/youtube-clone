import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId = req.user._id
    //TODO: create playlist

    if([ name, description ].some((field) => { field?.trim() === ""})) {   
        throw new apiError(400, "All fields are required")
    }
    
    const playlist = await Playlist.create({
        name,
        description,
        owner: userId
    })

    if(!playlist) {
        throw new apiError(500, "Something went wrong while creating playlist")
    }

    return res.status(201).json(
        new apiResponse(200, playlist._id, "Playlist created successfully")
    )
    
})   

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    
    if (!userId || userId.trim() === '') {
        throw new apiError(400, "User ID is required");
    }

    const playlist = await Playlist.findOne({ owner: new mongoose.Types.ObjectId(userId) });
  
    if( !playlist ) {
        throw new apiError(400, "Playlist not found for the specified user")
    }

    return res.status(200).json(new apiResponse(200, playlist, "Playlist fectched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if (!playlistId || playlistId.trim() === '') {
        throw new apiError(400, "Playlist ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    return res.status(200).json(new apiResponse(200, playlist, "Playlist fectched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    //using the playlistId push video id as an array element in the document
    
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Invalid playlist ID")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid Video ID")
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    if (playlist.videos.includes(videoId)) {
        throw new apiError(400, "Video already exists in the playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res.status(200).json(new apiResponse(200, playlist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Invalid playlist ID");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    const index = playlist.videos.indexOf(videoId);
    
    if (index === -1) {
        throw new apiError(400, "Video not found in the playlist");
    }

    playlist.videos.splice(index, 1);
    playlist.save();

    return res.status(200).json( new apiResponse(200, playlist, "Video successfully removed from the playlist"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.deleteOne(new mongoose.Types.ObjectId(playlistId));

    if (playlist.deletedCount === 1) {
        return res.status(200).json(new apiResponse(200, playlist.deletedCount, "Playlist deleted successfully"))
    } else {
        throw new apiError(500, "Something went wrong while performing delete operation")
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {

    const {playlistId} = req.params
    const {name, description} = req.body

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Invalid playlist ID");
    }

    if([ name, description ].some((field) => { field?.trim() === ""})) {   
        throw new apiError(400, "All fields are required")
    }

    const playlistExists = await Playlist.findById(playlistId);
    if (!playlistExists) {
        throw new apiError(404, "Playlist not found");
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId,
    {
        $set: {
            name,
            description
        }
    },
    {new: true}
    )

    if(!playlist) {
        return res.status(200).json(new apiError(200, "Something went wrong while updating playlist"))
    }

    return res.status(200).json(new apiResponse(200, playlist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}