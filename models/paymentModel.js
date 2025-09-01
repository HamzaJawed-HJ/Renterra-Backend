// models/paymentModel.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    agreementId: { type: mongoose.Schema.Types.ObjectId, ref: "Agreement", required: true },
    amount: { type: Number, required: true }, // amount in paisa (smallest currency unit)
    currency: { type: String, default: "pkr" },

    stripeSessionId: { type: String },   // Stripe Checkout session ID
    stripePaymentIntentId: { type: String }, // Stripe payment intent ID
    status: { 
      type: String, 
      enum: ["pending", "paid", "failed"], 
      default: "pending" 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
