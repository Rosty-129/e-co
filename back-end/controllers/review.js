import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createreview = async (req, res) => {
  try {
    const userid = req.user.id;
    const { text, productid } = req.body;

    if (!text || !productid) {
      return res.status(400).json({ message: "text and productid are required" });
    }

    await prisma.Review.create({
      data: {
        userid,
        text,
        productid: Number(productid),   // ← was raw string; Review.productid is Int
      },
    });

    return res.status(200).json({ message: "review created" });
  } catch (err) {
    console.error("createreview:", err);
    return res.status(500).json({ message: "failed to create review" });
  }
};

export const updatereview = async (req, res) => {
  try {
    const userid = req.user.id;
    const reviewid = Number(req.params.id);   // ← was Number(req.params) → NaN
    const { text } = req.body;

    const review = await prisma.Review.findFirst({
      where: {
        id: reviewid,
        userid,                                // ← was userid: userid (undefined)
      },
    });

    if (!review) {
      return res.status(404).json({ message: "review not found" });
    }

    await prisma.Review.update({
      where: { id: reviewid },
      data: { text },
    });

    return res.status(200).json({ message: "review updated" });
  } catch (err) {
    console.error("updatereview:", err);
    return res.status(500).json({ message: "failed to update review" });
  }
};

export const deletereview = async (req, res) => {
  try {
    const userid = req.user.id;
    const reviewid = Number(req.params.id);

    const review = await prisma.Review.findFirst({
      where: {
        id: reviewid,
        userid,
      },
    });

    if (!review) {
      return res.status(404).json({ message: "review not found" });
    }

    await prisma.Review.delete({
      where: { id: reviewid },
    });

    return res.status(200).json({ message: "review deleted" });
  } catch (err) {
    console.error("deletereview:", err);
    return res.status(500).json({ message: "failed to delete review" });
  }
};

export const getallmyreviews = async (req, res) => {
  try {
    const userid = req.user.id;
    const { productid } = req.query;   // ← was req.body (GET has no body)

    const reviews = await prisma.Review.findMany({
      where: {
        userid,
        ...(productid ? { productid: Number(productid) } : {}),
      },
    });

    return res.status(200).json({ message: "got mine", newone: reviews });
  } catch (err) {
    console.error("getallmyreviews:", err);
    return res.status(500).json({ message: "failed to load reviews" });
  }
};

export const getallreviews = async (req, res) => {
  try {
    const { productid } = req.query;

    const reviews = await prisma.Review.findMany({
      where: productid ? { productid: Number(productid) } : {},
      include: {
        user: { select: { firstname: true, lastname: true } },   // ← for displayName()
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ message: "got all", newone: reviews });
  } catch (err) {
    console.error("getallreviews:", err);
    return res.status(500).json({ message: "failed to load reviews" });
  }
};

export default prisma;