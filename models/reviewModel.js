import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    agreementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agreement",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // owner is stored in User collection
      required: true,
    },
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner", // renter is from Owner collection
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// // ✅ Ensure renter can review only once per agreement
// reviewSchema.index({ agreementId: 1, renterId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
