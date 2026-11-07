
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getPagination = (query) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    return {
        page,
        limit,
        skip: (page - 1) * limit
    };
};

export const createreview = async (req, res) => {
    try {
        const userid = req.user.id;
        const { text, productid } = req.body;

        if (!text || !productid) {
            return res.status(400).json({
                message: "text and productid are required"
            });
        }

        await prisma.Review.create({
            data: {
                userid,
                text,
                productid: Number(productid)
            }
        });

        return res.status(200).json({
            message: "review created"
        });

    } catch (err) {
        console.error("createreview:", err);
        return res.status(500).json({
            message: "failed to create review"
        });
    }
};

export const updatereview = async (req, res) => {
    try {
        const userid = req.user.id;
        const reviewid = Number(req.params.id);
        const { text } = req.body;

        const result = await prisma.Review.updateMany({
            where: {
                id: reviewid,
                userid
            },
            data: {
                text
            }
        });

        if (result.count === 0) {
            return res.status(404).json({
                message: "review not found"
            });
        }

        return res.status(200).json({
            message: "review updated"
        });

    } catch (err) {
        console.error("updatereview:", err);
        return res.status(500).json({
            message: "failed to update review"
        });
    }
};

export const deletereview = async (req, res) => {
    try {
        const userid = req.user.id;
        const reviewid = Number(req.params.id);

        const result = await prisma.Review.deleteMany({
            where: {
                id: reviewid,
                userid
            }
        });

        if (result.count === 0) {
            return res.status(404).json({
                message: "review not found"
            });
        }

        return res.status(200).json({
            message: "review deleted"
        });

    } catch (err) {
        console.error("deletereview:", err);
        return res.status(500).json({
            message: "failed to delete review"
        });
    }
};

export const getallmyreviews = async (req, res) => {
    try {
        const userid = req.user.id;
        const { productid } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        const where = {
            userid,
            ...(productid ? {
                productid: Number(productid)
            } : {})
        };

        const [reviews, count] = await Promise.all([
            prisma.Review.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { createdAt: "desc" },
                    { id: "desc" }
                ]
            }),
            prisma.Review.count({ where })
        ]);

        return res.status(200).json({
            message: "got mine",
            newone: reviews,
            count,
            page,
            totalPages: Math.ceil(count / limit)
        });

    } catch (err) {
        console.error("getallmyreviews:", err);
        return res.status(500).json({
            message: "failed to load reviews"
        });
    }
};

export const getallreviews = async (req, res) => {
    try {
        const { productid } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        const where = productid
            ? { productid: Number(productid) }
            : {};

        const [reviews, count] = await Promise.all([
            prisma.Review.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            firstname: true
                        }
                    }
                },
                orderBy: [
                    { createdAt: "desc" },
                    { id: "desc" }
                ]
            }),
            prisma.Review.count({ where })
        ]);

        return res.status(200).json({
            message: "got all",
            newone: reviews,
            count,
            page,
            totalPages: Math.ceil(count / limit)
        });

    } catch (err) {
        console.error("getallreviews:", err);
        return res.status(500).json({
            message: "failed to load reviews"
        });
    }
};

export default prisma;
