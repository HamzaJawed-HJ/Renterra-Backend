import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    category: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    timePeriod: { type: String, required: true },  // e.g., 'hourly', 'daily'
    location: { type: String, required: true },
    image: { type: String, required: true },  // Image path from upload
    ownerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
