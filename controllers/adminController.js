import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';
import Owner from '../models/owner.js';
import User from '../models/User.js';
import RentalRequest from '../models/rentalRequestModel.js';
import Product from '../models/productModel.js';

const createAdmin = async (req, res) => {

    const {email, password} = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        };

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
            email,
            password: hashedPassword
        });

        await newAdmin.save();
        res.status(201).json({ message: 'Admin created successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};  

// const loginAdmin = async (req, res) => {
//     const { email, password } = req.body;
//     try {

//         if (!email || !password) {
//             return res.status(400).json({ message: 'Invalid Credentials' });
//         };

//         const admin = await Admin.findOne({ email });
//         if (!admin || admin.role !== 'admin') {
//             return res.status(401).json({ message: 'Invalid credentials or not an admin' });
//         }

//         // Compare password
//         const isMatch = await bcrypt.compare(password, admin.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid credentials' });
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//             { id: admin._id, role: admin.role },
//             process.env.JWT_SECRET,
//             { expiresIn: '1d' }
//         );

//         // Set token in cookies
//         res.status(200).json({ token, admin });

//         res.json({ success: true, message: 'Login successful' });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };


//gpt bhae code 
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin || admin.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid credentials or not an admin' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};


const getAllUsers = async (req, res) => {
    try {
        const owners = await Owner.find().sort({ createdAt: -1 }); // newest first
        res.status(200).json({ success: true, renters: owners });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await Owner.findOne({ _id: id });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};



const getAllRenters = async (req, res) => {
    try {
        const owners = await User.find().sort({ createdAt: -1 }); // newest first
        res.status(200).json({ success: true, owners });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getRenter = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};



//all the Rental Request

export const getAllRentalRequestsAdmin = async (req, res) => {
  try {
    const rentalRequests = await RentalRequest.find()
      .populate('productID')
      .populate('renterID')
      .populate('ownerID');

    res.status(200).json({ success: true, rentalRequests });
  } catch (error) {
    console.error('Error in getAllRentalRequestsAdmin:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};



export const getAllProductsWithOwnerDetails = async (req, res) => {
  try {
    // Optional: Ensure only admin can access
    if (!req.adminId) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const products = await Product.find()
      .populate({
        path: 'ownerID',
        select: 'fullName email phoneNumber shopName shopAddress area cnic profilePicture'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Add these two controllers to adminController.js

// Toggle block/unblock for Renter (User model)
export const toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been ${user.isBlocked ? 'blocked' : 'unblocked'}.`,
      user,
    });
  } catch (error) {
    console.error('Error toggling block status for user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle block/unblock for Owner (Owner model)
export const toggleBlockOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const owner = await Owner.findById(id);

    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }

    owner.isBlocked = !owner.isBlocked;
    await owner.save();

    res.status(200).json({
      success: true,
      message: `Owner has been ${owner.isBlocked ? 'blocked' : 'unblocked'}.`,
      owner,
    });
  } catch (error) {
    console.error('Error toggling block status for owner:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};







export { loginAdmin, getAllUsers, getUser, createAdmin,  getAllRenters, getRenter };