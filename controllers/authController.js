import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Owner from '../models/owner.js';

// Register User
export const register = async (req, res) => {
  const { fullName, email, password, phoneNumber, role, cnic, area } = req.body;

  if (!fullName || !email || !password || !phoneNumber || !role || !cnic || !area) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (role !== 'renter') {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    // Check if user exists
    const existingOwner = await Owner.findOne({ email });
    if (existingOwner) return res.status(400).json({ message: 'Renter already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new Owner
    const owner = new Owner({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      cnic,
      area,
    });

    await owner.save();
    res.status(201).json({ message: 'Owner registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Owner.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Renter not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked by the admin' });
    }



    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//upload Image

export const uploadOwnerImage = async (req, res) => {
  try {
    const userId = req.userId; // Set by authMiddleware
    const profilePicture = req.files['personalPicture']?.[0];
    const cnicPicture = req.files['cnicPicture']?.[0];

    const updatedFields = {};
    if (profilePicture) updatedFields.profilePicture = `${profilePicture.filename}`;
    if (cnicPicture) updatedFields.cnicPicture = `${cnicPicture.filename}`;

    const updatedUser = await Owner.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true }
    );

    res.status(200).json({
      message: 'Files uploaded successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

