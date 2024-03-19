import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getVideoComments, addComment, updateComment, deleteComment } from "../controllers/comment.controller.js";

const router = Router()

router.route("/all-comments/:videoId").get(verifyJWT, getVideoComments)
router.route("/add-comment/:videoId").post(verifyJWT, addComment)
router.route("/edit-comment/:commentId").patch(verifyJWT, updateComment)
router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment)

export default router