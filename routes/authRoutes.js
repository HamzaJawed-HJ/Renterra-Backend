// authRoutes.js
import express from 'express';
const router = express.Router();
import { uploadFiles } from '../middleware/multer.js'; // Correct case
import {register, login } from '../controllers/authController.js'
 
router.post('/register', register);

router.post('/upload', uploadFiles, (req, res) => {
    try {
        const personalPicture = req.files['personalPicture']?.[0];
        const cnicPicture = req.files['cnicPicture']?.[0];

        res.status(200).json({
            message: 'Files uploaded successfully',
            personalPicture,
            cnicPicture,
        });
    } catch (error) {
        res.status(500).json({ message: 'File upload failed', error: error.message });
    }
});

router.post('/login', login);

// Named export
export default router; // Make sure to export the router as default
