// models/notificationModel.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    renterRequestID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RentalRequest', // Reference to rentalRequest
        required: true,
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User who gets notified
            //    ref: 'Owner', // Reference to the User who gets notified

        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    seen: {
        type: Boolean,
        default: false, // Default is false (unseen)
    },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
