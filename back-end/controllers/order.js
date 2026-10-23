import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createorder = async (req, res) => {
    try {
        const { address, items } = req.body;
        const userid = req.user.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        let totalcost = 0;
        const enrichedItems = [];

        for (const item of items) {
            const product = await prisma.Product.findUnique({
                where: { id: Number(item.productid) }
            });

            if (!product) {
                return res.status(400).json({ message: `Product #${item.productid} not found` });
            }

            if (product.Stock < item.quantity) {
                return res.status(400).json({ message: `${product.name} does not have enough stock` });
            }

            totalcost += product.price * item.quantity;
            enrichedItems.push({
                productid: product.id,
                quantity: item.quantity,
                unitprice: product.price,
            });
        }

        const newOrder = await prisma.Order.create({
            data: {
                userid,
                total: totalcost,
                address: address || null,
            }
        });

        for (const item of enrichedItems) {
            await prisma.OrderItem.create({
                data: {
                    orderid: newOrder.id,
                    productid: item.productid,
                    quantity: item.quantity,
                    unitPrice: item.unitprice,
                }
            });

            await prisma.Product.update({
                where: { id: item.productid },
                data: { Stock: { decrement: item.quantity } }
            });
        }

        const fullOrder = await prisma.Order.findUnique({
            where: { id: newOrder.id },
            include: {
                items: { include: { product: true } },
                user: true,
            }
        });

        return res.status(201).json({
            message: "order created",
            order: fullOrder
        });

    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);
        return res.status(500).json({ message: error.message || "something went wrong" });
    }
};

export const getallorder = async (req, res) => {
    try {
        const userid = req.user.id;

        const all = await prisma.Order.findMany({
            where: { userid },
            include: {
                items: { include: { product: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return res.status(200).json(all);

    } catch (error) {
        console.error("GET ORDERS ERROR:", error);
        return res.status(500).json({ message: "something went wrong" });
    }
};

// ⭐ NEW: Admin sees ALL orders from ALL customers
export const getallordersadmin = async (req, res) => {
    try {
        const all = await prisma.Order.findMany({
            include: {
                items: { include: { product: true } },
                user: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json(all);

    } catch (error) {
        console.error("ADMIN GET ORDERS ERROR:", error);
        return res.status(500).json({ message: "something went wrong" });
    }
};

export const changetocomplete = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.Order.update({
            where: { id: Number(id) },
            data: { status: "COMPLETED" }   // uppercase, matches frontend
        });

        return res.status(200).json({ message: "order completed", order });

    } catch (error) {
        console.error("CHANGE TO COMPLETE ERROR:", error);
        return res.status(500).json({ message: "something went wrong" });
    }
};

export const changetodisapprove = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.Order.update({
            where: { id: Number(id) },
            data: { status: "DISAPPROVED" }   // fixed: one P, uppercase
        });

        return res.status(200).json({ message: "order disapproved", order });

    } catch (error) {
        console.error("CHANGE TO DISAPPROVE ERROR:", error);
        return res.status(500).json({ message: "something went wrong" });
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

        return res.status(200).json({ message: "stock changed", product });

    } catch (error) {
        console.error("CHANGE STOCK ERROR:", error);
        return res.status(500).json({ message: "something went wrong" });
    }
};

export default prisma;