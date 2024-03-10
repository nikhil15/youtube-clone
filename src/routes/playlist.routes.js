import { Router } from "express";
import { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, 
    removeVideoFromPlaylist, deletePlaylist, updatePlaylist } from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/create-playlist").post(verifyJWT, createPlaylist)
router.route("/all-playlist/user/:userId").get(verifyJWT, getUserPlaylists)
router.route("/add-to-playlist/:playlistId/:videoId").patch(verifyJWT, addVideoToPlaylist)
router.route("/get-playlist/:playlistId").get(verifyJWT, getPlaylistById)
router.route("/remove-video/:playlistId/:videoId").delete(verifyJWT, removeVideoFromPlaylist)
router.route("/delete/:playlistId/").delete(verifyJWT, deletePlaylist)
router.route("/update/:playlistId").patch(verifyJWT, updatePlaylist)

export default router