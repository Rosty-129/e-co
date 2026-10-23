import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createproduct = async (req, res) => {
  try {
    const { name, description, categoryid, price, Stock } = req.body;

    if (!name || !categoryid) {
      return res.status(400).json({ message: "name and categoryid are required" });
    }

    const pro = await prisma.Product.create({
      data: {
        name,
        description,
        categoryid: Number(categoryid),
        price: Number(price) || 0,
        Stock: Number(Stock) || 0,
      }
    });

    return res.status(201).json({ message: "product created", product: pro });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return res.status(500).json({ message: error.message || "error creating product" });
  }
};

export const updateproduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, categoryid, price, Stock } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (categoryid !== undefined) data.categoryid = Number(categoryid);
    if (price !== undefined) data.price = Number(price);
    if (Stock !== undefined) data.Stock = Number(Stock);

    const updated = await prisma.Product.update({
      where: { id: Number(id) },
      data,
    });

    return res.status(200).json({ message: "product updated", product: updated });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return res.status(500).json({ message: error.message || "error updating product" });
  }
};

export const deleteproduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.Product.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "product deleted" });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return res.status(500).json({ message: error.message || "error deleting product" });
  }
};

export const getallproduct = async (req, res) => {
  try {
    // Support both GET query params (?search=...&categoryid=...) and POST body
    const { search, categoryid } = { ...req.query, ...(req.body || {}) };
    const where = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (categoryid) {
      where.categoryid = Number(categoryid);
    }

    const all = await prisma.Product.findMany({
      where,
      include: {
        productphoto: true,
        category: true,
      },
    });

    return res.status(200).json(all);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return res.status(500).json({ message: error.message || "error fetching products" });
  }
};

export const getoneproduct = async (req, res) => {
  try {
    const { id } = req.params;

    const one = await prisma.Product.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        productphoto: true,
      },
    });

    if (!one) {
      return res.status(404).json({ message: "product not found" });
    }

    return res.status(200).json(one);
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    return res.status(500).json({ message: error.message || "error fetching product" });
  }
};

export default prisma;