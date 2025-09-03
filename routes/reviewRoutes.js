import express from "express";
import {
  createReview,
  getOwnerReviews,
  getMyReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();

// Renter adds a review after agreement completion
router.post("/", authMiddleware, createReview);

// Public: get all reviews of an owner
router.get("/owner/:ownerId", getOwnerReviews);

// Owner: get my reviews
router.get("/me", authMiddleware, getMyReviews);

// Admin: delete review
router.delete("/:reviewId",authMiddleware , deleteReview);

export default router;
