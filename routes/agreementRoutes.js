// routes/agreementRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  generateAgreement,
  listMyAgreements,
  getAgreementDetails,
  markAgreementCompleted 
} from "../controllers/agreementController.js";

const router = express.Router();

// Generate from rentalRequest + dates (only authenticated users)
router.post("/generate", authMiddleware, generateAgreement);

// List mine (admin sees all)
router.get("/", authMiddleware, listMyAgreements);

// ✅ Owner marks agreement as completed
router.put("/:agreementId/complete",authMiddleware , markAgreementCompleted);

// // Get one agreement's metadata
// router.get("/single/:id", authMiddleware, getAgreement);

// // Download the PDF
// router.get("/:id/download", authMiddleware, downloadAgreement);


// GET Agreement details by rentalRequestId
router.get("/:rentalRequestId", getAgreementDetails);

export default router;
