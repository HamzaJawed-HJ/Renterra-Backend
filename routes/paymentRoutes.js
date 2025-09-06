// routes/paymentRoutes.js
import express from "express";
import { createPaymentIntent, verifyPaymentIntent } from "../controllers/paymentController.js";
import authMiddleware from '../middleware/authMiddleware.js'; // Use your existing auth middleware

const router = express.Router();

router.post("/create-payment-intent",authMiddleware, createPaymentIntent);
router.get("/verify",authMiddleware, verifyPaymentIntent);

export default router;
