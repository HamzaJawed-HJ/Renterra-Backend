import Product from '../models/productModel.js';
import { uploadFiles } from '../middleware/multer.js';
import path from 'path';

// Create Product
export const createProduct = async (req, res) => {
    const { category, name, description, price, timePeriod, location} = req.body;
    const ownerID = req.ownerId;
 
    console.log("Owner ID:", ownerID);

    const imageName = path.basename(req.files.image[0].path);
    try {
        const newProduct = new Product({
            category,
            name,
            description,
            price,
            timePeriod,
            location,
            image: imageName, // Assuming single image upload
            ownerID,
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 
// Get All Products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Edit Product
export const editProduct = async (req, res) => {
    const { productId } = req.params;
    const { category, name, description, price, timePeriod, location } = req.body;

    try {
        const product = await Product.findById(productId);
        console.log(product);
        
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Ensure the logged-in user is the owner of the product
        if (product.ownerID.toString() !== req.ownerId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to edit this product' });
        }

        // Update product details
        product.category = category || product.category;
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.timePeriod = timePeriod || product.timePeriod;
        product.location = location || product.location;
        
        // Only update image if a new one was uploaded
        if (req.files && req.files.image && req.files.image[0]) {
            const imageName = path.basename(req.files.image[0].path);
            product.image = imageName;
        }

        await product.save();
        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Product
export const deleteProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Ensure the logged-in user is the owner of the product
        if (product.ownerID.toString() !== req.ownerId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this product' });
        }

        await Product.findByIdAndDelete(productId);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

    
// Get Product By ID
export const getProductById = async (req, res) => {
    const { productId } = req.params; // Get the product ID from the request parameters

    try {
        // Find the product by its ID
        const product = await Product.findById(productId);

        // If the product doesn't exist, return a 404 error
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Return the product if it exists
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const getMyProducts = async (req, res) => {
    
    const ownerID = req.ownerId;

    try {
        const products = await Product.find({ ownerID: ownerID }); // 👈 filters only this user's products
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
