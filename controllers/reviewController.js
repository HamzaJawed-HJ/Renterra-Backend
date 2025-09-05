import Review from "../models/reviewModel.js";
import Agreement from "../models/agreementModel.js";

// ✅ Create Review
export const createReview = async (req, res) => {
  try {

    const { agreementId, rating, comment } = req.body;
    const renterId = req.renterId; // renter is logged in

    // 1. Validate Agreement
    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    // 2. Ensure agreement is completed before review
    if (agreement.status !== "completed") {
      return res.status(400).json({ message: "You can only review after ride completion" });
    }

    // 3. Prevent duplicate reviews per agreement
    const existingReview = await Review.findOne({ agreementId, renterId });
    if (existingReview) {
      return res.status(400).json({ message: "You already gave Review" });
    }

    // 4. Create Review
    const review = await Review.create({
      agreementId,
      ownerId: agreement.ownerID,
      renterId: agreement.renterID,
      productId: agreement.productID,
      rating,
      comment,
    });

    // 5. Mark Agreement as reviewed
    agreement.reviewed = true;
    await agreement.save();

    console.log("Marking agreement as reviewed:", agreementId);
    res.status(201).json({
      success: true,
      message: "Review added successfully", review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get reviews for an owner (public)
export const getOwnerReviews = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const reviews = await Review.find({ ownerId })
      .populate("renterId", "fullName email profilePicture")
      .populate("productId", "name image price");
      
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get reviews for logged-in owner (my reviews)
export const getMyReviews = async (req, res) => {
  try {
    const ownerId = req.ownerId;
    const reviews = await Review.find({ ownerId })
      .populate("renterId", "name email")
      .populate("productId", "title");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
