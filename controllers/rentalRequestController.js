// controllers/rentalRequestController.js
import RentalRequest from '../models/rentalRequestModel.js';
import Product from '../models/productModel.js'; // Import the product model to check product validity
import { createNotification } from './notificationController.js'; // Import notification controller
import Owner from '../models/owner.js';
import Notification  from '../models/notificationModel.js';


// Create Rental Request
export const createRentalRequest = async (req, res) => {
    const { productId } = req.body; // Get the product ID from the request body
    const renterId = req.renterId; // Assuming the user is the renter

    try {
        // Find the product to make sure it exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if a request already exists from this renter for the same product
        const existingRequest = await RentalRequest.findOne({
            productID: productId,
            renterID: renterId,
        });

        if (existingRequest) {
            return res.status(400).json({
                message: 'You have already sent a rental request for this product.',
            });
        }

        // ✅ Step 2: Check if the product's owner exists in Owner model
        // const owner = await Owner.findById(product.ownerID);
        // if (!owner) {
        //     return res.status(404).json({ message: 'Owner not found' });
        // }

        // Check if the renter is not trying to rent their own product
        if (product.ownerID.toString() === renterId.toString()) {
            return res.status(400).json({ message: 'You cannot rent your own product' });
        }

        // Create a new rental request
        const newRequest = new RentalRequest({
            productID: productId,
            ownerID: product.ownerID,
            renterID: renterId,
            status: 'pending', // Default status is pending
        });

        await newRequest.save();

        // Create a notification for the product owner
        await createNotification(product.ownerID, `You have a new rental request for your product "${product.name}" from ${renterId}.`, newRequest._id);


        console.log('DEBUG - product.ownerID:', product.ownerID); // should be ObjectId
        console.log('DEBUG - renterId from req:', renterId);

        res.status(201).json({ message: 'Rental request created successfully', rentalRequest: newRequest });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Rental Request Status (Owner Accepts or Rejects)
export const updateRentalRequestStatus = async (req, res) => {
    const { rentalRequestId } = req.params;
    const { status } = req.body; // Status can be "accepted" or "rejected"

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        // Find the rental request by ID
        const rentalRequest = await RentalRequest.findById(rentalRequestId);

        console.log(rentalRequest);

        if (!rentalRequest) {
            return res.status(404).json({ message: 'Rental request not found' });
        }

        // FIXED: Handle different user ID fields from middleware
        const userId = req.ownerId || req.renterId || req.userId || req.user?.id;

        console.log("rental owner" + rentalRequest.ownerID.toString());
        console.log("request owner" + userId.toString());

        // Ensure that only the owner can update the request status
        if (rentalRequest.ownerID.toString() !== userId) {

            return res.status(403).json({ message: 'You are not authorized to update this request' });
        }

        // Update the rental request status
        rentalRequest.status = status;
        await rentalRequest.save();
        res.status(200).json({ message: 'Rental request status updated', rentalRequest });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Rental Requests for a User
export const getAllRentalRequests = async (req, res) => {
    // FIXED: Handle different user ID fields from middleware
    const userId = req.ownerId || req.renterId || req.userId || req.user?.id;

    try {
        // Get all rental requests where the user is either the renter or the owner
        const rentalRequests = await RentalRequest.find({
            $or: [{ ownerID: userId }, { renterID: userId }],
        }).populate('productID renterID ownerID');

        res.status(200).json(rentalRequests);
    } catch (error) {
        console.error('Error in getAllRentalRequests:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add this new controller function
export const deleteRentalRequest = async (req, res) => {
    const { rentalRequestId } = req.params;

    // Use the same user ID logic as your other functions
    const userId = req.ownerId || req.renterId || req.userId;

    try {
        // Find the rental request
        const rentalRequest = await RentalRequest.findById(rentalRequestId);

        if (!rentalRequest) {
            return res.status(404).json({ message: 'Rental request not found' });
        }

        // Only allow renter to delete their own requests
        if (rentalRequest.renterID.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You can only cancel your own requests' });
        }

        // Only allow canceling pending requests
        if (rentalRequest.status !== 'pending') {
            return res.status(400).json({
                message: `Cannot cancel ${rentalRequest.status} requests. Only pending requests can be canceled.`
            });
        }

        // Delete the request
        await RentalRequest.findByIdAndDelete(rentalRequestId);

  // ❗ Delete related notifications
        await Notification.deleteMany({ renterRequestID: rentalRequestId });


        res.status(200).json({
            message: 'Rental request canceled successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting rental request:', error);
        res.status(500).json({ message: error.message });
    }
};