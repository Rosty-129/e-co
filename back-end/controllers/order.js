
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

export const createorder = async (req, res) => {
    try {
        const { address, items } = req.body;
        const userid = req.user.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "No items in order"
            });
        }

        const quantities = new Map();

        for (const item of items) {
            const productid = Number(item.productid);

            if (
                !Number.isInteger(productid) ||
                productid <= 0 ||
                !Number.isInteger(item.quantity) ||
                item.quantity <= 0
            ) {
                return res.status(400).json({
                    message: "Invalid product or quantity"
                });
            }

            quantities.set(
                productid,
                (quantities.get(productid) || 0) + item.quantity
            );
        }

        const enrichedItems = [...quantities.entries()].map(
            ([productid, quantity]) => ({
                productid,
                quantity
            })
        );

        const fullOrder = await prisma.$transaction(async (tx) => {

            // Retrieve all products in ONE query.
            const products = await tx.Product.findMany({
                where: {
                    id: {
                        in: enrichedItems.map(item => item.productid)
                    }
                },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    Stock: true
                }
            });

            const productMap = new Map(
                products.map(product => [product.id, product])
            );

            let totalcost = 0;

            const orderItems = [];

            for (const item of enrichedItems) {
                const product = productMap.get(item.productid);

                if (!product) {
                    throw new Error(`Product #${item.productid} not found`);
                }

                if (product.Stock < item.quantity) {
                    throw new Error(
                        `${product.name} does not have enough stock`
                    );
                }

                totalcost += product.price * item.quantity;

                orderItems.push({
                    productid: product.id,
                    quantity: item.quantity,
                    unitPrice: product.price
                });
            }

            const newOrder = await tx.Order.create({
                data: {
                    userid,
                    total: totalcost,
                    address: address || null
                }
            });

            // Create all order items in ONE operation.
            await tx.OrderItem.createMany({
                data: orderItems.map(item => ({
                    ...item,
                    orderid: newOrder.id
                }))
            });

            // Update stock safely. The condition prevents stock
            // from becoming negative if another order changes it.
            for (const item of enrichedItems) {
                const result = await tx.Product.updateMany({
                    where: {
                        id: item.productid,
                        Stock: {
                            gte: item.quantity
                        }
                    },
                    data: {
                        Stock: {
                            decrement: item.quantity
                        }
                    }
                });

                if (result.count !== 1) {
                    throw new Error(
                        `Not enough stock for product #${item.productid}`
                    );
                }
            }

            return tx.Order.findUnique({
                where: {
                    id: newOrder.id
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    },
                    user: true
                }
            });
        });

        return res.status(201).json({
            message: "order created",
            order: fullOrder
        });

    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);

        if (
            error.message.includes("does not have enough stock") ||
            error.message.includes("Not enough stock") ||
            error.message.includes("not found")
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "something went wrong"
        });
    }
};


export const getallorder = async (req, res) => {
    try {
        const userid = req.user.id;
        const { page, limit, skip } = getPagination(req.query);

        const all = await prisma.Order.findMany({
            where: { userid },
            skip,
            take: limit,
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: [
                { createdAt: "desc" },
                { id: "desc" }
            ]
        });

        return res.status(200).json(all);

    } catch (error) {
        console.error("GET ORDERS ERROR:", error);
        return res.status(500).json({
            message: "something went wrong"
        });
    }
};


// Admin sees ALL orders from ALL customers
export const getallordersadmin = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);

        const all = await prisma.Order.findMany({
            skip,
            take: limit,
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: true
            },
            orderBy: [
                { createdAt: "desc" },
                { id: "desc" }
            ]
        });

        return res.status(200).json(all);

    } catch (error) {
        console.error("ADMIN GET ORDERS ERROR:", error);
        return res.status(500).json({
            message: "something went wrong"
        });
    }
};


export const changetocomplete = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.Order.update({
            where: { id: Number(id) },
            data: { status: "COMPLETED" }
        });

        return res.status(200).json({
            message: "order completed",
            order
        });

    } catch (error) {
        console.error("CHANGE TO COMPLETE ERROR:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                message: "order not found"
            });
        }

        return res.status(500).json({
            message: "something went wrong"
        });
    }
};


export const changetodisapprove = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.Order.update({
            where: { id: Number(id) },
            data: { status: "DISAPPROVED" }
        });

        return res.status(200).json({
            message: "order disapproved",
            order
        });

    } catch (error) {
        console.error("CHANGE TO DISAPPROVE ERROR:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                message: "order not found"
            });
        }

        return res.status(500).json({
            message: "something went wrong"
        });
    }
};


export const changestock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        const product = await prisma.Product.update({
            where: { id: Number(id) },
            data: { Stock: Number(stock) }
        });

        return res.status(200).json({
            message: "stock changed",
            product
        });

    } catch (error) {
        console.error("CHANGE STOCK ERROR:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                message: "product not found"
            });
        }

        return res.status(500).json({
            message: "something went wrong"
        });
    }
};

export default prisma;
