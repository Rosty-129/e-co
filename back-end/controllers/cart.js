import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addtocart = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const userid = req.user.id;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                message: "quantity must be greater than 0"
            });
        }

        const cart = await prisma.Cart.findUnique({
            where: { userid }
        });

        if (!cart) {
            return res.status(400).json({
                message: "cart not found"
            });
        }

        const product = await prisma.Product.findUnique({
            where: { id: Number(id) }
        });

        if (!product) {
            return res.status(404).json({
                message: "product not found"
            });
        }

        if (product.Stock <= 0) {
            return res.status(400).json({
                message: "product not available"
            });
        }

        const cartitem = await prisma.CartItem.findFirst({
            where: {
                cartid: cart.id,
                productid: product.id
            }
        });

        if (!cartitem) {
            if (quantity > product.Stock) {
                return res.status(400).json({
                    message: "not enough stock"
                });
            }

            await prisma.CartItem.create({
                data: {
                    quantity,
                    productid: product.id,
                    cartid: cart.id
                }
            });

            return res.status(200).json({
                message: "item added"
            });
        }

        const newquantity = cartitem.quantity + quantity;

        if (newquantity > product.Stock) {
            return res.status(400).json({
                message: "not enough stock"
            });
        }

        await prisma.CartItem.update({
            where: { id: cartitem.id },
            data: {
                quantity: newquantity
            }
        });

        return res.status(200).json({
            message: "item quantity updated"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "something went wrong"
        });
    }
};


export const getusercart = async (req, res) => {
    try {
        const userid = req.user.id;

        const cart = await prisma.Cart.findUnique({
            where: { userid },
            include: {
                cartitems: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!cart) {
            return res.status(404).json({
                message: "cart not found"
            });
        }

        return res.status(200).json(cart);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "something went wrong"
        });
    }
};


export const updatequantity = async (req, res) => {
    try {
        const userid = req.user.id;
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                message: "quantity must be greater than 0"
            });
        }

        const cart = await prisma.Cart.findUnique({
            where: { userid }
        });

        if (!cart) {
            return res.status(404).json({
                message: "cart not found"
            });
        }

        const cartitem = await prisma.CartItem.findFirst({
            where: {
                id: Number(id),
                cartid: cart.id
            },
            include: {
                product: true
            }
        });

        if (!cartitem) {
            return res.status(404).json({
                message: "cart item not found"
            });
        }

        if (quantity > cartitem.product.Stock) {
            return res.status(400).json({
                message: "not enough stock"
            });
        }

        await prisma.CartItem.update({
            where: {
                id: cartitem.id
            },
            data: {
                quantity
            }
        });

        return res.status(200).json({
            message: "quantity updated"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "something went wrong"
        });
    }
};


export const deleteitem = async (req, res) => {
    try {
        const userid = req.user.id;
        const { id } = req.params;

        const cart = await prisma.Cart.findUnique({
            where: { userid }
        });

        if (!cart) {
            return res.status(404).json({
                message: "cart not found"
            });
        }

        const cartitem = await prisma.CartItem.findFirst({
            where: {
                id: Number(id),
                cartid: cart.id
            }
        });

        if (!cartitem) {
            return res.status(404).json({
                message: "cart item not found"
            });
        }

        await prisma.CartItem.delete({
            where: {
                id: cartitem.id
            }
        });

        return res.status(200).json({
            message: "item deleted"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "something went wrong"
        });
    }
};


export const clearcart = async (req, res) => {
    try {
        const userid = req.user.id;

        const cart = await prisma.Cart.findUnique({
            where: { userid }
        });

        if (!cart) {
            return res.status(404).json({
                message: "cart not found"
            });
        }

        await prisma.CartItem.deleteMany({
            where: {
                cartid: cart.id
            }
        });

        return res.status(200).json({
            message: "cart cleared"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "something went wrong"
        });
    }
};


export default prisma;