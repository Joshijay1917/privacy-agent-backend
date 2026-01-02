import mongoose from "mongoose";

const interestSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
}, { timestamps: true })

export const Interest = mongoose.model('Interest', interestSchema)