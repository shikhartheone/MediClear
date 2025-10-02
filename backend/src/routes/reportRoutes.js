import { Router } from "express";
import multer from "multer";
import { simplifyReport } from "../controllers/reportController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// This will handle POST requests to /api/reports/simplify
router.post("/simplify", upload.single("reportImage"), simplifyReport);

export default router;
