import mongoose from 'mongoose';

// Define schema for storing file URLs
const imageSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    imageName: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

// Create a model based on the schema
const Image = mongoose.model('Image', imageSchema);

export default Image;