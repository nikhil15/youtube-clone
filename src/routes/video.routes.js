import { Router } from "express";
import { publishAVideo, getVideoById } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/watch/:videoId").get(getVideoById)

//secured video routes
router.route("/publish-video").post(verifyJWT, upload.fields([{ name: "videoFile", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), publishAVideo)

export default router