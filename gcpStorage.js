import { Storage } from '@google-cloud/storage';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const storage = new Storage({
    keyFilename: path.join(process.cwd(), 'serviceAccounts.json') // Path to JSON key
});

const BucketName = process.env.GCP_BUCKET_NAME; // Store bucket name in .env
const bucket = storage.bucket(BucketName);
// Function to Upload Image to GCP
export const uploadImageToGCP = async (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject('No file provided');
        }

        const blob = bucket.file(`uploads/${Date.now()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('finish', async () => {
            const publicUrl = `https://storage.googleapis.com/${BucketName}/${blob.name}`;
            resolve(publicUrl);
        });

        blobStream.on('error', (err) => {
            reject(err);
        });

        blobStream.end(file.buffer);
    });
};