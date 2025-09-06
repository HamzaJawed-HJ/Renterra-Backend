// controllers/paymentController.js
import stripe from "../config/stripe.js";
import Payment from "../models/paymentModel.js";
import Agreement from "../models/agreementModel.js";
import Product from "../models/productModel.js";

// 1. Create PaymentIntent
export const createPaymentIntent = async (req, res) => {
  try {
    const { agreementId } = req.body;

    // Fetch Agreement
    const agreement = await Agreement.findById(agreementId).populate("productID");
    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

     // Prevent duplicate payments
    const existingPayment = await Payment.findOne({ agreementId });
    if (existingPayment) {
      return res.status(400).json({ message: "Payment already done for this agreement" });
    }

    // Get price from Product
    const product = agreement.productID;
    if (!product || !product.price) {
      return res.status(400).json({ message: "Product or price not found" });
    }

    // Convert USD price → cents
    const amount = Math.round((product.price/ 280)* 100); // e.g., $10.99 → 1099 cents

    // Create PaymentIntent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd", // ✅ charging in USD
      payment_method_types: ["card"],
    });

    // Save in DB
    const payment = await Payment.create({
      agreementId,
       payerId: agreement.renterID, // renter is paying
      amount,
      currency: "usd",
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
    });

    res.json({
      clientSecret: paymentIntent.client_secret, // frontend uses this
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Error in createPaymentIntent:", error);
    res.status(500).json({ message: "Error creating payment intent" });
  }
};

// 2. Verify PaymentIntent (after Flutter confirms)
export const verifyPaymentIntent = async (req, res) => {
  try {
    const { payment_intent_id } = req.query;

    if (!payment_intent_id) {
      return res.status(400).json({ message: "Missing payment_intent_id" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id );
    if (!paymentIntent) {
      return res.status(404).json({ message: "PaymentIntent not found" });
    }

    const payment = await Payment.findOne({ stripePaymentIntentId: payment_intent_id  });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (paymentIntent.status === "succeeded") {
      payment.status = "paid";
       // if paid → update agreement
  if (payment.status === "paid") {
    await Agreement.findByIdAndUpdate(payment.agreementId, { isPaid: true });
  }
      await payment.save();
    } else if (paymentIntent.status === "requires_payment_method") {
      payment.status = "failed";
      await payment.save();
    }

    res.json({ status: payment.status });
  } catch (error) {
    console.error("Error in verifyPaymentIntent:", error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};
