// models/agreementModel.js
import mongoose from "mongoose";

const agreementSchema = new mongoose.Schema(
  {
    rentalRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "RentalRequest", required: true },
    // ⚠ Match your existing rentalRequestModel refs exactly:
    ownerID:  { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },  // matches rentalRequest.ownerID
    renterID: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true },  // matches rentalRequest.renterID
    productID:{ type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    pickupDate:  { type: Date, required: true },
    returnDate:  { type: Date, required: true },

    status: { type: String, enum: ["active", "completed"], default: "active" },


    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileUrl:  { type: String, required: true }, // e.g. /uploads/agreements/...
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true }, // whoever clicked “Generate”
  },
  { timestamps: true }
);

export default mongoose.model("Agreement", agreementSchema);
