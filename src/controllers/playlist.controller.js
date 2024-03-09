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
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    //using the playlistId push video id as an array element in the document
    
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Invalid playlist ID")
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

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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