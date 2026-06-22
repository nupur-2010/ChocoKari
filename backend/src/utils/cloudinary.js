import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const isBase64Image = (str) => typeof str === "string" && str.startsWith("data:image/");

const uploadImage = async (dataUrl, folder = "ChocoKari/images", publicId = null) => {
    if (!dataUrl || !isBase64Image(dataUrl)) return dataUrl;
    try {
        const result = await cloudinary.uploader.upload(dataUrl, {
            folder,
            public_id: publicId || undefined,
            resource_type: "image",
        });
        return result.secure_url;
    } catch (err) {
        console.error("Cloudinary upload failed:", err.message);
        throw new Error("Image upload failed. Please try again.");
    }
};

const uploadImages = async (dataUrls, folder = "ChocoKari/images") => {
    if (!Array.isArray(dataUrls)) return [];
    return Promise.all(dataUrls.map((url) => uploadImage(url, folder)));
};

export { uploadImage, uploadImages, isBase64Image };
export default cloudinary;

