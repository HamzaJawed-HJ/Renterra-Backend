import Stripe from "stripe";

import dotenv from "dotenv";
dotenv.config();

console.log("Stripe Key:", process.env.STRIPE_SECRET_KEY?.slice(0, 8)); // just first chars for safety

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20", // or latest
});
export default stripe;
