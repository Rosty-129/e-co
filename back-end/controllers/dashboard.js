import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const revenue = async (req, res) => {
    let totalrevenue = 0;

    const allorders = await prisma.Order.findMany({});

    if (allorders.length === 0) {
        return res.status(200).json({ totalRevenue: 0 });
    }

    for (const order of allorders) {
        totalrevenue = totalrevenue + order.total;
    }

    return res.status(200).json(totalrevenue);
};

export const orderstoday = async (req, res) => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    const allorders = await prisma.Order.findMany({
        where: {
            createdAt: {
                gte: midnight
            }
        }
    });

    const allorder = await prisma.Order.count({
        where: {
            createdAt: {
                gte: midnight
            }
        }
    });

    return res.status(200).json({
        orders: allorders,
        count: allorder
    });
};

export const pendingorders = async (req, res) => {
    const allorders = await prisma.Order.findMany({
        where: {
            status: "pending"
        }
    });

    const allorder = await prisma.Order.count({
        where: {
            status: "pending"
        }
    });

    return res.status(200).json({
        orders: allorders,
        count: allorder
    });
};

export const completedorders = async (req, res) => {
    const allorders = await prisma.Order.findMany({
        where: {
            status: "completed"
        }
    });

    const allorder = await prisma.Order.count({
        where: {
            status: "completed"
        }
    });

    return res.status(200).json({
        orders: allorders,
        count: allorder
    });
};

export const totalcustomers = async (req, res) => {
    const allcustomers = await prisma.User.count({
        where: {
            role: "user"
        }
    });

    return res.status(200).json(allcustomers);
};

export const totalproducts = async (req, res) => {
    const allproducts = await prisma.Product.count({});

    return res.status(200).json(allproducts);
};

export const lowstock = async (req, res) => {
    const s = 5;

    const allproducts = await prisma.Product.count({
        where: {
            Stock: {
                lt: s
            }
        }
    });

    const allproduct = await prisma.Product.findMany({
        where: {
            Stock: {
                lt: s
            }
        }
    });

    return res.status(200).json({
        products: allproduct,
        count: allproducts
    });
};

export const outofstock = async (req, res) => {
    const s = 0;

    const allproducts = await prisma.Product.count({
        where: {
            Stock: {
                equals: s
            }
        }
    });

    const allproduct = await prisma.Product.findMany({
        where: {
            Stock: {
                equals: s
            }
        }
    });

    return res.status(200).json({
        products: allproduct,
        count: allproducts
    });
};

export default prisma;