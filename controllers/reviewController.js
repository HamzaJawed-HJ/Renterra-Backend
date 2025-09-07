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


export const getMyReviews = async (req, res) => {
  try {
    let reviews;

    if (req.ownerId) {
      // Owner → see reviews written about them
      reviews = await Review.find({ ownerId: req.ownerId })
        .populate("renterId", "fullName email profilePicture")
        .populate("productId", "name image price");
    } 
    else if (req.renterId) {
      // Renter/User → see reviews they gave
      reviews = await Review.find({ renterId: req.renterId })
        .populate("ownerId", "fullName email profilePicture")
         .populate("renterId", "fullName email profilePicture")
        .populate("productId", "name image price");
    } 
    else if (req.adminId) {
      // Optional: Admin → see all reviews
      reviews = await Review.find()
        .populate("renterId", "fullName email profilePicture")
        .populate("ownerId", "fullName email profilePicture")
        .populate("productId", "name image price");
    } 
    else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

     // 🔥 Keep the same response so frontend won’t crash
    res.json(reviews);
    // res.json({
    //   success: true,
    //   count: reviews.length,
    //   reviews,
    // });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Admin delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // 1. Find the review first
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // 2. Delete the review
    await Review.findByIdAndDelete(reviewId);

    // 3. Update the agreement’s reviewed field to false
    await Agreement.findByIdAndUpdate(review.agreementId, { reviewed: false });

    res.json({ message: "Review deleted successfully and agreement updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
