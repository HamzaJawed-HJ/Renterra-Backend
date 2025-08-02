// controllers/userController.js
import User from '../models/User.js';
import Owner from '../models/owner.js';

import Product from '../models/productModel.js';
import RentalRequest from '../models/rentalRequestModel.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Get user profile by ID
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user and exclude password
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics
    const totalProducts = await Product.countDocuments({ ownerID: userId });
    const totalRequests = await RentalRequest.countDocuments({
      $or: [
        { renterID: userId },
        { ownerID: userId }
      ]
    });

    // Calculate user rating (placeholder - you can implement actual rating logic)
    const userRating = 4.8; // This should come from actual reviews

    const profileData = {
      ...user.toObject(),
      totalProducts,
      totalRequests,
      rating: userRating
    };

    res.status(200).json({user: profileData});
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    // Get user ID from your auth middleware (it sets both ownerId and renterId)
    const userId = req.userId || req.ownerId || req.renterId;

    const { fullName, email, area, shopName, shopAddress } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
    }

    // Prepare update data
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email.toLowerCase();
    if (area) updateData.area = area;
    if (shopName) updateData.shopName = shopName;
    if (shopAddress) updateData.shopAddress = shopAddress;

    // Handle image uploads
    if (req.files) {
      if (req.files.personalPicture && req.files.personalPicture[0]) {
        // Delete old personal picture if exists
        if (user.personalPicture) {
          const oldPersonalPath = path.join(process.cwd(), 'uploads', user.personalPicture);
          if (fs.existsSync(oldPersonalPath)) {
            fs.unlinkSync(oldPersonalPath);
          }
        }
        updateData.personalPicture = path.basename(req.files.personalPicture[0].path);
      }
    }

    //   if (req.files.cnicPicture && req.files.cnicPicture[0]) {
    //     // Delete old CNIC picture if exists
    //     if (user.cnicPicture) {
    //       const oldCnicPath = path.join(process.cwd(), 'uploads', user.cnicPicture);
    //       if (fs.existsSync(oldCnicPath)) {
    //         fs.unlinkSync(oldCnicPath);
    //       }
    //     }
    //     updateData.cnicPicture = path.basename(req.files.cnicPicture[0].path);
    //   }
    // }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Change user password
export const changePassword = async (req, res) => {
  try {
    // Get user ID from your auth middleware
    const userId = req.userId || req.ownerId || req.renterId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
};

// Delete user account
export const deleteUserAccount = async (req, res) => {
  try {
    // Get user ID from your auth middleware
    const userId = req.userId || req.ownerId || req.renterId;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's products and associated images
    const userProducts = await Product.find({ ownerID: userId });
    for (const product of userProducts) {
      if (product.image) {
        const imagePath = path.join(process.cwd(), 'uploads', product.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }
    await Product.deleteMany({ ownerID: userId });

    // Delete user's rental requests
    await RentalRequest.deleteMany({
      $or: [
        { renterID: userId },
        { ownerID: userId }
      ]
    });



    // Delete user's profile images
    if (user.profilePicture) {
      const personalPath = path.join(process.cwd(), 'uploads', user.profilePicture);
      if (fs.existsSync(personalPath)) {
        fs.unlinkSync(personalPath);
      }
    }

    if (user.cnicPicture) {
      const cnicPath = path.join(process.cwd(), 'uploads', user.cnicPicture);
      if (fs.existsSync(cnicPath)) {
        fs.unlinkSync(cnicPath);
      }
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
};

// Get user public profile (for other users to view)
export const getUserPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user and exclude sensitive information
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics
    const totalProducts = await Product.countDocuments({ ownerID: userId });
    const userRating = 4.8; // This should come from actual reviews

    const publicProfile = {
      ...user.toObject(),
      totalProducts,
      rating: userRating
    };

    res.status(200).json({user: publicProfile});
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ message: 'Server error while fetching public profile' });
  }
};


// ------------------------


// Get Renteruser profile by ID
export const getReneterUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user and exclude password
    const user = await Owner.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics
    const totalProducts = await Product.countDocuments({ ownerID: userId });
    const totalRequests = await RentalRequest.countDocuments({
      $or: [
        { renterID: userId },
        { ownerID: userId }
      ]
    });

    // Calculate user rating (placeholder - you can implement actual rating logic)
    const userRating = 4.8; // This should come from actual reviews

    const profileData = {
      ...user.toObject(),
      totalProducts,
      totalRequests,
      rating: userRating
    };

    res.status(200).json({user: profileData});
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }

};


// Update user profile
export const updateReneterUserProfile = async (req, res) => {
  try {
    // Get user ID from your auth middleware (it sets both ownerId and renterId)
    const userId = req.userId || req.ownerId || req.renterId;

    const { fullName, email, area, phoneNumber } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    // Check if user exists
    const user = await Owner.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
    }

    // Prepare update data
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email.toLowerCase();
    if (area) updateData.area = area;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;


    // Update user
    const updatedUser = await Owner.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Change user password
export const changeReneterPassword = async (req, res) => {
  try {
    // Get user ID from your auth middleware
    const userId = req.userId || req.ownerId || req.renterId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 7) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find user with password
    const user = await Owner.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password  
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
};

// Delete user account
export const deleteReneterUserAccount = async (req, res) => {
  try {
    // Get user ID from your auth middleware
    const userId = req.userId || req.ownerId || req.renterId;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    // Find user
    const user = await Owner.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's products and associated images
    const userProducts = await Product.find({ ownerID: userId });

    for (const product of userProducts) {
      if (product.image) {
        const imagePath = path.join(process.cwd(), 'uploads', product.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }
    await Product.deleteMany({ ownerID: userId });

    // Delete user's rental requests
    await RentalRequest.deleteMany({
      $or: [
        { renterID: userId },
        { ownerID: userId }
      ]
    });


    // Delete user's profile images
    if (user.profilePicture) {
      const personalPath = path.join(process.cwd(), 'uploads', user.profilePicture);
      if (fs.existsSync(personalPath)) {
        fs.unlinkSync(personalPath);
      }
    }

    if (user.cnicPicture) {
      const cnicPath = path.join(process.cwd(), 'uploads', user.cnicPicture);
      if (fs.existsSync(cnicPath)) {
        fs.unlinkSync(cnicPath);
      }
    }

    // Delete user account
    await Owner.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
};








