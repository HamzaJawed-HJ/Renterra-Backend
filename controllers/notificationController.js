// controllers/notificationController.js
import Notification from '../models/notificationModel.js';

// Create a notification
export const createNotification = async (userId, message, renterRequestID) => {
    try {
        const notification = new Notification({
            userID: userId, // User to whom the notification is related (Product owner)
            message: message,
            renterRequestID: renterRequestID,
            seen: false, // Notification is unseen by default
        });

        await notification.save();
        console.log('Notification created for user');
    } catch (error) {
        console.error('Error creating notification:', error.message);
    }
};

// Get all notifications for a user (either owner or renter)
export const getNotifications = async (req, res) => {
    const userId  = req.userId; // Get the user ID from request params

    try {
        const notifications = await Notification.find({ userID: userId })
            .populate('renterRequestID')
            .populate('userID') // Optional: Populate the user data if needed
            .sort({ createdAt: -1 }); // Sort by latest notification first

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark notification as seen
export const markNotificationAsSeen = async (req, res) => {
    const { notificationId } = req.params;

    try {
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Mark the notification as seen
        notification.seen = true;
        await notification.save();

        res.status(200).json({ message: 'Notification marked as seen', notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

