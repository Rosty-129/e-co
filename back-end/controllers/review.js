import { PrismaClient } from "@prisma/client";
import Filter from "bad-words"; // Make sure to run: npm install bad-words

const prisma = new PrismaClient();
const filter = new Filter(); 

export const createreview = async (req, res) => {
  try {
    const userid = req.user.id;
    const { text, productid } = req.body;

    if (!text || !productid) {
      return res.status(400).json({ message: "text and productid are required" });
    }

    // FIX: Clean the text before saving to prevent unmoderated content
    const cleanText = filter.clean(text);

    await prisma.Review.create({
      data: {
        userid,
        text: cleanText, 
        productid: Number(productid), 
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
    const reviewid = Number(req.params.id); 
    const { text } = req.body;

    const review = await prisma.Review.findFirst({
      where: {
        id: reviewid,
        userid, // This secures against IDOR (users can only edit their own reviews)
      },
    });

    if (!review) {
      return res.status(404).json({ message: "review not found" });
    }

    // FIX: Clean the text before saving
    const cleanText = filter.clean(text);

    await prisma.Review.update({
      where: { id: reviewid },
      data: { text: cleanText },
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
        userid, // This secures against IDOR
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
    const { productid } = req.query; 

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
        // FIX: Removed lastname. Now it only pulls the firstname from the database.
        // The data leak is closed.
        user: { select: { firstname: true } }, 
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