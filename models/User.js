// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['renter', 'owner', 'admin'], required: true },
//   birthdate: { type: Date, required: true },
//   personalPicture: { type: String, required: true },
//   cnicPicture: { type: String, required: true },
//   cnicNumber: { type: String, required: true, match: /^\d{13}$/ },
//   location: { type: String, required: true },
// }, { timestamps: true });

// export default mongoose.model('User', userSchema);


import { Schema, model } from "mongoose";

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    phoneNumber: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    shopName: {
        type: String,
        required: true,
        trim: true,
    },
    shopAddress: {
        type: String,
        required: true,
        trim: true,
    },
    cnic: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    area: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        default: "renter",
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

export default model("User", userSchema)