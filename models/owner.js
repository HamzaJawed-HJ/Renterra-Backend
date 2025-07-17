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
        default: "owner",
    },
}, { timestamps: true })

export default model("Owner", userSchema)