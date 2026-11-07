import { PrismaClient } from "@prisma/client";
import {
    uploadProductImage,
    deleteCloudinaryImage
} from "../services/productImages.js";

const prisma = new PrismaClient();

const getPagination = (query) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    return {
        limit,
        skip: (page - 1) * limit
    };
};

const uploadFiles = async (files) => {
    const uploaded = [];

    try {
        for (const file of files || []) {
            const image = await uploadProductImage(file);
            uploaded.push(image);
        }

        return uploaded;
    } catch (error) {
        await Promise.allSettled(
            uploaded.map(image =>
                deleteCloudinaryImage(image.publicId)
            )
        );

        throw error;
    }
};

// CREATE PRODUCT
export const createproduct = async (req, res) => {
    let uploadedImages = [];

    try {
        const {
            name,
            description,
            categoryid,
            price,
            Stock
        } = req.body;

        uploadedImages = await uploadFiles(req.files);

        const product = await prisma.Product.create({
            data: {
                name,
                description,
                categoryid,
                price,
                Stock,

                productphoto: {
                    create: uploadedImages.map(image => ({
                        url: image.url,
                        publicId: image.publicId
                    }))
                }
            },

            include: {
                productphoto: {
                    orderBy: {
                        id: "asc"
                    }
                },
                category: true
            }
        });

        return res.status(201).json({
            message: "product created",
            product
        });

    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);

        await Promise.allSettled(
            uploadedImages.map(image =>
                deleteCloudinaryImage(image.publicId)
            )
        );

        return res.status(error.status || 500).json({
            message: error.message || "error creating product"
        });
    }
};

// UPDATE PRODUCT
export const updateproduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            categoryid,
            price,
            Stock
        } = req.body;

        const data = {};

        if (name !== undefined) data.name = name;
        if (description !== undefined) data.description = description;
        if (categoryid !== undefined) data.categoryid = categoryid;
        if (price !== undefined) data.price = price;
        if (Stock !== undefined) data.Stock = Stock;

        const updated = await prisma.Product.update({
            where: {
                id: Number(id)
            },
            data
        });

        return res.status(200).json({
            message: "product updated",
            product: updated
        });

    } catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                message: "product not found"
            });
        }

        return res.status(500).json({
            message: error.message || "error updating product"
        });
    }
};

// DELETE PRODUCT
export const deleteproduct = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const product = await prisma.Product.findUnique({
            where: { id },
            include: {
                productphoto: true
            }
        });

        if (!product) {
            return res.status(404).json({
                message: "product not found"
            });
        }

        // Delete the database records together.
        await prisma.$transaction(async (tx) => {
            await tx.ProductPhoto.deleteMany({
                where: { productid: id }
            });

            await tx.Product.delete({
                where: { id }
            });
        });

        // Cloudinary cleanup happens after the database deletion.
        // A failed cleanup does not leave broken photo records in the DB.
        const cleanupResults = await Promise.allSettled(
            product.productphoto
                .filter(photo => photo.publicId)
                .map(photo => deleteCloudinaryImage(photo.publicId))
        );

        cleanupResults.forEach(result => {
            if (result.status === "rejected") {
                console.error(
                    "CLOUDINARY CLEANUP ERROR:",
                    result.reason
                );
            }
        });

        return res.status(200).json({
            message: "product deleted"
        });

    } catch (error) {
        console.error("DELETE PRODUCT ERROR:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                message: "product not found"
            });
        }

        return res.status(500).json({
            message: error.message || "error deleting product"
        });
    }
};

// GET ALL PRODUCTS
export const getallproduct = async (req, res) => {
    try {
        const { search, categoryid } = {
            ...req.query,
            ...(req.body || {})
        };

        const { limit, skip } = getPagination(req.query);

        const where = {};

        if (search) {
            where.name = {
                contains: search,
                mode: "insensitive"
            };
        }

        if (categoryid) {
            where.categoryid = Number(categoryid);
        }

        const all = await prisma.Product.findMany({
            where,
            skip,
            take: limit,

            orderBy: [
                { createdAt: "desc" },
                { id: "desc" }
            ],

            include: {
                productphoto: {
                    orderBy: {
                        id: "asc"
                    }
                },
                category: true
            }
        });

        return res.status(200).json(all);

    } catch (error) {
        console.error("GET PRODUCTS ERROR:", error);

        return res.status(500).json({
            message: error.message || "error fetching products"
        });
    }
};

// GET ONE PRODUCT
export const getoneproduct = async (req, res) => {
    try {
        const { id } = req.params;

        const one = await prisma.Product.findUnique({
            where: {
                id: Number(id)
            },

            include: {
                category: true,

                productphoto: {
                    orderBy: {
                        id: "asc"
                    }
                }
            }
        });

        if (!one) {
            return res.status(404).json({
                message: "product not found"
            });
        }

        return res.status(200).json(one);

    } catch (error) {
        console.error("GET PRODUCT ERROR:", error);

        return res.status(500).json({
            message: error.message || "error fetching product"
        });
    }
};

export default prisma;