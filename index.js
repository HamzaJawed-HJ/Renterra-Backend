import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Routes
import authRoutes from './routes/authRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import userRoutes from './routes/userRoutes.js';  
import productRoutes from './routes/productRoutes.js';
import rentalRequestRoutes from './routes/rentalRequestRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; // ✅ Add this line


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving for uploads
// D:\Fyp Course\Renterra-Backend
const uploadsFolder = path.resolve('D:\\New folder', 'uploads');
app.use('/uploads', express.static(uploadsFolder));

// Routes
app.use('/api/user', authRoutes);              
app.use('/api/renter', ownerRoutes);              
app.use('/api/users', userRoutes);             
app.use('/api/products', productRoutes);       
app.use('/api/rentalRequests', rentalRequestRoutes); 
app.use('/api/notifications', notificationRoutes); 
app.use('/api/chat', chatRoutes);


// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'RentBazaar API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      rentalRequests: '/rentalRequests',
      notifications: '/api/notifications'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    availableRoutes: [
      '/api/auth',
      '/api/users', 
      '/api/products',
      '/rentalRequests',
      '/api/notifications'
    ]
  });
});

// MongoDB Connection
mongoose.connect(process.env.DB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => {
    console.log('MongoDB connected successfully!');
    console.log(`RentBazaar Backend is ready!`);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Static files served from: ${uploadsFolder}`);
  console.log(`API Documentation available at http://localhost:${PORT}`);
});

export default app;