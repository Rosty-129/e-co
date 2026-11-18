
import { PrismaClient } from "@prisma/client";
import { getOrSetCache } from "../utils/cache.js";

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

export const revenue = async (req, res) => {
    try {
        const totalRevenue = await getOrSetCache(
            "dashboard:revenue",
            60,
            async () => {
                const result = await prisma.Order.aggregate({
                    _sum: {
                        total: true
                    }
                });

                return result._sum.total || 0;
            }
        );

        return res.status(200).json({
            totalRevenue
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Could not calculate revenue"
        });
    }
};

export const orderstoday = async (req, res) => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    const { page, limit, skip } = getPagination(req.query);

    try {
        const [orders, count] = await Promise.all([
            prisma.Order.findMany({
                where: {
                    createdAt: {
                        gte: midnight
                    }
                },
                skip,
                take: limit,
                orderBy: [
                    { createdAt: "desc" },
                    { id: "desc" }
                ]
            }),
            prisma.Order.count({
                where: {
                    createdAt: {
                        gte: midnight
                    }
                }
            })
        ]);

        return res.status(200).json({
            orders,
            count,
            page,
            totalPages: Math.ceil(count / limit)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Could not get today's orders"
        });
    }
};

export const pendingorders = async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);

    try {
        const where = {
            status: "pending"
        };

        const [orders, count] = await Promise.all([
            prisma.Order.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { createdAt: "desc" },
                    { id: "desc" }
                ]
            }),
            prisma.Order.count({ where })
        ]);

        return res.status(200).json({
            orders,
            count,
            page,
            totalPages: Math.ceil(count / limit)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Could not get pending orders"
        });
    }
};

export const completedorders = async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);

    try {
        const where = {
            status: "completed"
        };

        const [orders, count] = await Promise.all([
            prisma.Order.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { createdAt: "desc" },
                    { id: "desc" }
                ]
            }),
            prisma.Order.count({ where })
        ]);

        return res.status(200).json({
            orders,
            count,
            page,
            totalPages: Math.ceil(count / limit)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Could not get completed orders"
        });
    }
};

export const totalcustomers = async (req, res) => {
    try {
        const allcustomers = await getOrSetCache(
            "dashboard:totalcustomers",
            60,
            async () => {
                return await prisma.User.count({
                    where: {
                        role: "user"
                    }
                });
            }
        );

        return res.status(200).json(allcustomers);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Could not count customers"
        });
    }
};

export const totalproducts = async (req, res) => {
    try {
        const allproducts = await getOrSetCache(
            "dashboard:totalproducts",
            60,
            async () => {
                return await prisma.Product.count();
            }
        );

        return res.status(200).json(allproducts);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Could not count products"
        });
    }
};

export const lowstock = async (req, res) => {
    const s = 5;
    const { page, limit, skip } = getPagination(req.query);

    try {
        const cacheKey = `dashboard:lowstock:page:${page}:limit:${limit}`;

        const result = await getOrSetCache(
            cacheKey,
            30,
            async () => {
                const where = {
                    Stock: {
                        lt: s
                    }
                };

                const [products, count] = await Promise.all([
                    prisma.Product.findMany({
                        where,
                        skip,
                        take: limit,
                        orderBy: [
                            { Stock: "asc" },
                            { id: "asc" }
                        ]
                    }),
                    prisma.Product.count({ where })
                ]);

                return {
                    products,
                    count,
                    page,
                    totalPages: Math.ceil(count / limit)
                };
            }
        );

        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Could not get low-stock products"
        });
    }
};

export const outofstock = async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);

    try {
        const cacheKey = `dashboard:outofstock:page:${page}:limit:${limit}`;

        const result = await getOrSetCache(
            cacheKey,
            30,
            async () => {
                const where = {
                    Stock: 0
                };

                const [products, count] = await Promise.all([
                    prisma.Product.findMany({
                        where,
                        skip,
                        take: limit,
                        orderBy: {
                            id: "asc"
                        }
                    }),
                    prisma.Product.count({ where })
                ]);

                return {
                    products,
                    count,
                    page,
                    totalPages: Math.ceil(count / limit)
                };
            }
        );

        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Could not get out-of-stock products"
        });
    }
};

export default prisma;
