import { PrismaClient } from "@prisma/client";

import {
    uploadProductImage,
    deleteCloudinaryImage
} from "../services/productImages.js";

const prisma = new PrismaClient();

// ADD MULTIPLE IMAGES TO AN EXISTING PRODUCT
export const createimage = async (req, res) => {
    const uploadedImages = [];

    try {
        const productId = Number(req.params.id);
        const files = req.files || [];

        if (files.length === 0) {
            return res.status(400).json({
                message: "At least one image is required"
            });
        }

        const product = await prisma.Product.findUnique({
            where: {
                id: productId
            },
            select: {
                id: true
            }
        });

        if (!product) {
            return res.status(404).json({
                message: "product not found"
            });
        }

        // Upload each image to Cloudinary.
        for (const file of files) {
            const image = await uploadProductImage(file);
            uploadedImages.push(image);
        }

        // Save their URLs and Cloudinary IDs in PostgreSQL.
        await prisma.ProductPhoto.createMany({
            data: uploadedImages.map(image => ({
                url: image.url,
                publicId: image.publicId,
                productid: productId
            }))
        });

        const photos = await prisma.ProductPhoto.findMany({
            where: {
                productid: productId
            },
            orderBy: {
                id: "asc"
            }
        });

        return res.status(201).json({
            message: "photos added",
            photos
        });

    } catch (error) {
        console.error("CREATE IMAGE ERROR:", error);

        // Remove uploaded Cloudinary files if database saving failed.
        await Promise.allSettled(
            uploadedImages.map(image =>
                deleteCloudinaryImage(image.publicId)
            )
        );

        return res.status(error.status || 500).json({
            message: error.message || "error adding images"
        });
    }
};

// DELETE ONE IMAGE
export const deleteimage = async (req, res) => {
    try {
        const imageId = Number(req.params.id);

        const photo = await prisma.ProductPhoto.findUnique({
            where: {
                id: imageId
            }
        });

        if (!photo) {
            return res.status(404).json({
                message: "image not found"
            });
        }

        // Delete the database record first.
        await prisma.ProductPhoto.delete({
            where: {
                id: imageId
            }
        });

        // Then attempt to remove the Cloudinary asset.
        if (photo.publicId) {
            try {
                await deleteCloudinaryImage(photo.publicId);
            } catch (error) {
                console.error("CLOUDINARY DELETE ERROR:", error);
            }
        }

        return res.status(200).json({
            message: "photo deleted"
        });

    } catch (error) {
        console.error("DELETE IMAGE ERROR:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                message: "image not found"
            });
        }

        return res.status(500).json({
            message: error.message || "error deleting image"
        });
    }
};

export default prisma;