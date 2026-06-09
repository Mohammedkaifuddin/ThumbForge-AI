import express from 'express';
import { verifyToken } from "../middleware/auth.js";
import { generateThumbnail, getHistory, deleteThumbnail } from "../controllers/thumbnailcontroller.js";

const router = express.Router();

router.post("/generate", verifyToken, generateThumbnail);
router.get("/history", verifyToken, getHistory);
router.delete("/:id", verifyToken, deleteThumbnail);

export default router;