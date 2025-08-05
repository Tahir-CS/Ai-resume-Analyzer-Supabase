import express from 'express';
import { upload } from '../middleware/multer.js';
import { analyzeResume, getFeedback, downloadFeedback } from '../controllers/resume.controller.js';

const router = express.Router();

// Resume analysis routes
router.post('/upload-resume', upload.single('resume'), analyzeResume);
router.get('/feedback/:id', getFeedback);
router.get('/feedback/:id/download', downloadFeedback);

export default router;
