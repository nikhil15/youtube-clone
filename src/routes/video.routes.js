import { Router } from "express";
import { publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus, getAllVideos } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/watch/:videoId").get(getVideoById)
//secured video routes
router.route("/view").get(verifyJWT, getAllVideos)
router.route("/publish").post(verifyJWT, upload.fields([{ name: "videoFile", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), publishAVideo)
router.route("/update/:videoId").patch(verifyJWT, upload.fields([{ name: "videoFile", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), updateVideo)
router.route("/delete/:videoId").delete(verifyJWT, deleteVideo)
router.route("/unpublish/:videoId").patch(verifyJWT, togglePublishStatus)

export default router