// routes/notificationRoutes.js
import express from 'express';
import { getNotifications, markNotificationAsSeen } from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all notifications for a user
router.get('/', authMiddleware, getNotifications);

// Mark notification as seen
router.put('/:notificationId/seen', authMiddleware, markNotificationAsSeen);

export default router;
