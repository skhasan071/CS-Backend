import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import multer from "multer";
import { uploadImageToGCP } from "./gcpStorage.js";
import Image from "./models/Image.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use("/api", authRoutes);

// MongoDB Connection & Server Start
const PORT = process.env.PORT || 4500;

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      // Upload the file to Google Cloud Storage and get the public URL
      const imageUrl = await uploadImageToGCP(req.file);

      // Create a new Image document to store the URL in MongoDB
      const newImage = new Image({
          imageUrl: imageUrl,  // Store the public URL of the uploaded image
          imageName: req.file.originalname,  // Store the name of the file
      });

      // Save the image document to MongoDB
      await newImage.save();
      console.log("Received File:", imageUrl);

      res.json({
          success: true,
          message: "File uploaded successfully.",
          imageUrl: imageUrl,
           // Return the public URL of the image
      });

  } catch (error) {
    console.log(error);
      res.status(500).json({ success: false, message: error.message });

    }
  });


mongoose
  .connect(process.env.URI)
  .then(() => {
    console.log("Connected Successfully");
    app.listen(PORT, () => {
      console.log(`Server Running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1); // Exit process on DB connection failure
  }
);