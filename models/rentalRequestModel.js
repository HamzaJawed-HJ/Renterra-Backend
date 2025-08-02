// models/rentalRequestModel.js
import mongoose from 'mongoose';

const rentalRequestSchema = new mongoose.Schema({
  productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  ownerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  renterID: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('RentalRequest', rentalRequestSchema);
