// models/paymentModel.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    agreementId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Agreement", 
      required: true 
    },

    payerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Owner",   // the renter who made the payment
      required: true 
    },
    amount: { type: Number, required: true }, // stored in cents
    currency: { type: String, default: "usd" },

    stripePaymentIntentId: { type: String, required: true }, // main link to Stripe
    status: { 
      type: String, 
      enum: ["pending", "paid", "failed"], 
      default: "pending" 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
