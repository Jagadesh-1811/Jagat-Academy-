import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("❌ Cloudinary upload failed: No file path provided")
            return null
        }

        console.log("📤 Attempting to upload file to Cloudinary:", localFilePath)

        let response;
        if (localFilePath.match(/\.(mp4|mkv|mov|avi|wmv|flv|webm)$/i)) {
             // Use upload_large for videos to prevent timeout
             response = await cloudinary.uploader.upload_large(localFilePath, {
                 resource_type: "video",
                 chunk_size: 6000000
             });
        } else {
             // Use regular upload for images/thumbnails
             response = await cloudinary.uploader.upload(localFilePath, {
                 resource_type: "auto"
             });
        }

        //file has been uploaded successfully
        console.log("✅ File uploaded to Cloudinary successfully:", response.secure_url)
        console.log("📊 Upload details - Format:", response.format, "Size:", response.bytes, "bytes")

        fs.unlinkSync(localFilePath)
        return response.secure_url

    } catch (error) {
        console.error("❌ Cloudinary upload error:", error.message)
        console.error("Error details:", error)

        // Try to clean up file if it exists
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath)
                console.log("🗑️ Cleaned up local file after failed upload")
            }
        } catch (cleanupError) {
            console.error("Failed to cleanup file:", cleanupError.message)
        }

        return null
    }
}


export default uploadOnCloudinary