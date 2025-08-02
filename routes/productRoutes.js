import express from 'express';
import { createProduct, getAllProducts, editProduct, deleteProduct, getProductById, getMyProducts } from '../controllers/productController.js';
import { uploadFiles } from '../middleware/multer.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Middleware to protect routes


const router = express.Router();
 
// Create product (requires image upload)
router.post('/create', authMiddleware, uploadFiles, createProduct);

// Get all products
router.get('/', getAllProducts);

// Edit product (requires image upload)
router.put('/:productId', authMiddleware, uploadFiles, editProduct);

// Delete product
router.delete('/:productId', authMiddleware, deleteProduct);

router.get('/product/:productId', getProductById);  // New route to get product by ID

router.get('/my',authMiddleware, getMyProducts);  // New route to get product by ID



export default router;
