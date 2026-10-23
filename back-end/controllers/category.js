import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createcat = async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Name is required"
        });
    }

    try {
        const category = await prisma.Category.create({
            data: {
                name,
                description
            }
        });

        return res.status(201).json({
            message: "Category created!",
            category
        });

    } catch (error) {
        return res.status(500).json({
            message: "Could not create category"
        });
    }
};

export const getallcat = async (req, res) => {
    try {
        const categories = await prisma.Category.findMany();

        return res.status(200).json(categories);

    } catch (error) {
        return res.status(500).json({
            message: "Could not get categories"
        });
    }
};

export const getone = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await prisma.Category.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                products: true
            }
        });

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        return res.status(200).json(category);

    } catch (error) {
        return res.status(500).json({
            message: "Could not get category"
        });
    }
};

export const updatecat = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const category = await prisma.Category.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        const updatedCategory = await prisma.Category.update({
            where: {
                id: Number(id)
            },
            data: {
                name,
                description
            }
        });

        return res.status(200).json({
            message: "Category updated!",
            category: updatedCategory
        });

    } catch (error) {
        return res.status(500).json({
            message: "Could not update category"
        });
    }
};

export const deletecat = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await prisma.Category.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        await prisma.Category.delete({
            where: {
                id: Number(id)
            }
        });

        return res.status(200).json({
            message: "Category deleted!"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Could not delete category"
        });
    }
};


export default prisma;