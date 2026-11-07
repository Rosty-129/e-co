import { v2 as cloudinary } from "cloudinary";
import { fileTypeFromBuffer } from "file-type";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

export const uploadProductImage = async (file) => {
    const detectedType = await fileTypeFromBuffer(file.buffer);

    if (!detectedType || !allowedTypes.includes(detectedType.mime)) {
        const error = new Error(
            "Only JPEG, PNG, and WebP images are allowed"
        );

        error.status = 400;
        throw error;
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "e-co/products",
                resource_type: "image",
                allowed_formats: ["jpg", "jpeg", "png", "webp"]
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        );

        stream.end(file.buffer);
    });
};

export const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) return;

    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image"
    });

    if (
        result.result !== "ok" &&
        result.result !== "not found"
    ) {
        throw new Error(`Cloudinary deletion failed: ${result.result}`);
    }
};