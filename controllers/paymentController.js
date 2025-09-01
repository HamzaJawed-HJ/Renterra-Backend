// controllers/paymentController.js
import stripe from "../config/stripe.js";
import Payment from "../models/paymentModel.js";
import Agreement from "../models/agreementModel.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { agreementId } = req.body;

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) return res.status(404).json({ message: "Agreement not found" });

    // Example: fixed rent amount (you can fetch from product)
    const amount = 1000 * 100; // 1000 PKR → 100000 paisa

    // Create a Payment record first
    const payment = await Payment.create({
      agreementId,
      amount,
      currency: "pkr",
      status: "pending",
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: `Agreement #${agreement._id}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    });

    // Save sessionId in DB
    payment.stripeSessionId = session.id;
    await payment.save();

    res.json({ url: session.url }); // frontend will redirect to this URL
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating checkout session" });
  }
};

// After redirect success
export const verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.query;

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const payment = await Payment.findOne({ stripeSessionId: session_id });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (session.payment_status === "paid") {
      payment.status = "paid";
      payment.stripePaymentIntentId = session.payment_intent;
      await payment.save();
    } else {
      payment.status = "failed";
      await payment.save();
    }

    res.json({ status: payment.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};
