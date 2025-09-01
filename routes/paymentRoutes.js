// routes/paymentRoutes.js
import express from "express";
import { createCheckoutSession, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.get("/verify", verifyPayment);

export default router;
