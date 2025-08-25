// controllers/agreementController.js
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

import Agreement from "../models/agreementModel.js";
import RentalRequest from "../models/rentalRequestModel.js";
import { AGREEMENTS_DIR } from "../utils/paths.js";

export const generateAgreement = async (req, res) => {
  try {
    const { rentalRequestId, pickupDate, returnDate } = req.body;

    if (!rentalRequestId || !pickupDate || !returnDate) {
      return res.status(400).json({ message: "rentalRequestId, pickupDate and returnDate are required" });
    }

    // Grab the rentalRequest + related documents
    const rr = await RentalRequest.findById(rentalRequestId)
      .populate("productID")
      .populate("ownerID")   // ref: 'User'
      .populate("renterID"); // ref: 'Owner'

    if (!rr) return res.status(404).json({ message: "Rental request not found" });

    // Build file path
    const fileName = `agreement-${rentalRequestId}-${Date.now()}.pdf`;
    const filePath = path.join(AGREEMENTS_DIR, fileName);
    const fileUrl  = `/uploads/agreements/${fileName}`;

    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const outStream = fs.createWriteStream(filePath);
    doc.pipe(outStream);

    // Watermark (light & diagonal)
    const addWatermark = (text = "RENTERRA DOCUMENT") => {
      doc.save();
      doc.fillColor("#000000");
      doc.opacity(0.08);
      doc.fontSize(80);
      // rotate around page center
      const cx = doc.page.width / 2;
      const cy = doc.page.height / 2;
      doc.rotate(-35, { origin: [cx, cy] });
      doc.text(text, cx - 300, cy - 40, { width: 600, align: "center" });
      doc.restore();
      doc.opacity(1);
    };
    addWatermark();

    // Header
    doc.fontSize(22).text("Rental Agreement", { align: "center" });
    doc.moveDown();

    // Parties
    doc.fontSize(12).text("PARTIES", { underline: true });
    doc.moveDown(0.5);
    doc.text(`Owner (Lender): ${rr.ownerID?.fullName || "-"}  |  Email: ${rr.ownerID?.email || "-"}`);
    doc.text(`Renter (Borrower): ${rr.renterID?.fullName || "-"}  |  Email: ${rr.renterID?.email || "-"}`);
    doc.moveDown();

    // Asset
    doc.text("ASSET", { underline: true });
    doc.moveDown(0.5);
    doc.text(`Product: ${rr.productID?.name || "-"} (${rr.productID?.category || "-"})`);
    doc.text(`Location: ${rr.productID?.location || "-"}`);
    doc.moveDown();

    // Dates
    const pd = new Date(pickupDate);
    const rd = new Date(returnDate);
    doc.text("RENTAL PERIOD", { underline: true });
    doc.moveDown(0.5);
    doc.text(`Pickup: ${pd.toDateString()}`);
    doc.text(`Return: ${rd.toDateString()}`);
    doc.moveDown();

    // Simple terms (hardcoded)
    doc.text("TERMS & CONDITIONS", { underline: true });
    doc.moveDown(0.5);
    const bullets = [
      "The renter agrees to return the product in the same condition as received.",
      "The renter is responsible for any loss or damage during the rental period.",
      "Late returns may incur additional charges as per platform policy.",
      "This agreement is governed by the platform rules of RentBazaar."
    ];
    bullets.forEach((b, i) => doc.text(`${i + 1}. ${b}`));
    doc.moveDown(2);

    // Signatures (no digital sig required; placeholders)
    doc.text("Owner Signature: __________________________");
    doc.moveDown();
    doc.text("Renter Signature: _________________________");

    doc.end();

    // Wait until the file is fully written
    await new Promise((resolve, reject) => {
      outStream.on("finish", resolve);
      outStream.on("error", reject);
    });

    // Save in DB
    const record = await Agreement.create({
      rentalRequestId,
      ownerID: rr.ownerID?._id,
      renterID: rr.renterID?._id,
      productID: rr.productID?._id,
      pickupDate: pd,
      returnDate: rd,
      fileName,
      filePath,
      fileUrl,
      createdBy: req.userId || req.ownerId || req.renterId || req.adminId,
    });

    return res.status(201).json({
      success: true,
      message: "Agreement generated",
      agreement: record,
    });
  } catch (err) {
    console.error("generateAgreement error:", err);
    return res.status(500).json({ message: "Server error generating agreement" });
  }
};

// List agreements for current user (owner/renter/admin)
export const listMyAgreements = async (req, res) => {
  try {
    const me = req.userId || req.ownerId || req.renterId || req.adminId;

    // Admin sees all, others see theirs
    const query = req.adminId ? {} : { $or: [{ ownerID: me }, { renterID: me }] };

    const items = await Agreement.find(query)
      .populate("productID", "name category location")
      .populate("ownerID", "fullName email")
      .populate("renterID", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, agreements: items });
  } catch (err) {
    console.error("listMyAgreements error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get one agreement metadata (JSON)
export const getAgreement = async (req, res) => {
  try {
    const ag = await Agreement.findById(req.params.id)
      .populate("productID", "name category location")
      .populate("ownerID", "fullName email")
      .populate("renterID", "fullName email");

    if (!ag) return res.status(404).json({ message: "Agreement not found" });

    // Simple access control: admin or participant only
    const me = req.userId || req.ownerId || req.renterId || req.adminId;
    if (!req.adminId && String(ag.ownerID?._id) !== String(me) && String(ag.renterID?._id) !== String(me)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json({ success: true, agreement: ag });
  } catch (err) {
    console.error("getAgreement error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Download/stream the PDF file
export const downloadAgreement = async (req, res) => {
  try {
    const ag = await Agreement.findById(req.params.id);
    if (!ag) return res.status(404).json({ message: "Agreement not found" });

    // Simple access control again
    const me = req.userId || req.ownerId || req.renterId || req.adminId;
    if (!req.adminId && String(ag.ownerID) !== String(me) && String(ag.renterID) !== String(me)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!fs.existsSync(ag.filePath)) {
      return res.status(410).json({ message: "File no longer exists on server" });
    }

    return res.download(ag.filePath, ag.fileName);
  } catch (err) {
    console.error("downloadAgreement error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



export const getAgreementDetails = async (req, res) => {
  try {
    const { rentalRequestId } = req.params;

    const rentalRequest = await RentalRequest.findById(rentalRequestId)
      .populate('productID')  // fetch car details
      .populate('ownerID')    // fetch owner details
      .populate('renterID');  // fetch renter details

    if (!rentalRequest) {
      return res.status(404).json({ message: 'Rental request not found' });
    }

    res.json({
      renter: rentalRequest.renterID,
      owner: rentalRequest.ownerID,
      car: rentalRequest.productID,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};