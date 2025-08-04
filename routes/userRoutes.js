// routes/userRoutes.js
import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  getUserPublicProfile,
  getReneterUserProfile,

  updateReneterUserProfile,
  deleteReneterUserAccount,
  changeReneterPassword



} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Use your existing auth middleware
import { uploadFiles } from '../middleware/multer.js'; // Use your existing multer setup

const router = express.Router();

// Profile Routes
router.get('/profile', authMiddleware, getUserProfile);
router.get('/public-profile', getUserPublicProfile); // Public profile (no auth required)

// Update profile with file uploads (using your existing multer setup)
router.put('/profile/update',
  authMiddleware,   // Use your existing auth middleware
  uploadFiles,      // Use your existing multer middleware
  updateUserProfile
);

// Password & Account Management
router.put('/change-password', authMiddleware, changePassword);
router.delete('/delete-account', authMiddleware, deleteUserAccount);


// ------------------------
// Renter Routes
// ------------------------

// Profile Routes

router.get('/profile-renter', authMiddleware, getReneterUserProfile);
router.get('/public-renter-profile', getReneterUserProfile); // Public profile (no auth required)

// Update profile with file uploads (using your existing multer setup)
router.put('/profile-renter/update',
  authMiddleware,   // Use your existing auth middleware
  updateReneterUserProfile
);

// Password & Account Management
router.put('/renter/change-password', authMiddleware, changeReneterPassword);
router.delete('/renter/delete-account', authMiddleware, deleteReneterUserAccount);



export default router;