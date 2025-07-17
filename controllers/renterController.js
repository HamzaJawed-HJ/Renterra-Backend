import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Register User
export const register = async (req, res) => {
  const {
    fullName,
    email,
    password,
    phoneNumber,
    shopName,
    shopAddress,
    cnic,
    area,
    role,
  } = req.body;
 
  if(!fullName || !email || !password || !phoneNumber || !shopName || !shopAddress || !cnic || !area || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if(role !== 'owner') {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      shopName,
      shopAddress,
      cnic,
      area,
      role
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Login User
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

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

