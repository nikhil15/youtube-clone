import { Router } from "express";
import { createPlaylist, getUserPlaylists, addVideoToPlaylist } from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/create-playlist").post(verifyJWT, createPlaylist)
router.route("/all-playlist/user/:userId").get(verifyJWT, getUserPlaylists)
router.route("/add-to-playlist/:playlistId/:videoId").patch(verifyJWT, addVideoToPlaylist)

export default router