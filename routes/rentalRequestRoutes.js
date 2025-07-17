// routes/rentalRequestRoutes.js
import express from 'express';
import { createRentalRequest, updateRentalRequestStatus, getAllRentalRequests, deleteRentalRequest } from '../controllers/rentalRequestController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Correctly importing authMiddleware

const router = express.Router();
 
// Route to create a new rental request
router.post('/create', authMiddleware, createRentalRequest);

router.delete('/:rentalRequestId', authMiddleware, deleteRentalRequest);

// Route to update the status of a rental request (owner approves or rejects)
router.put('/:rentalRequestId/status', authMiddleware, updateRentalRequestStatus);

// Route to get all rental requests for a user (both as renter and owner)
router.get('/', authMiddleware, getAllRentalRequests);

export default router;
