import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createreview = async (req,res) => {
    const id = req.user.id;
    const {text , productid} = req.body
    const newone = await prisma.Review.create({
        data : {userid : id , text , productid}
    })
    return res.status(200).json({message : "review created"})
}
export const updatereview = async (req,res) => {
    const id = req.user.id;
    const reviewid = Number(req.params)
    const {text} = req.body

  const review = await prisma.Review.findFirst({
        where: {
            id: reviewid,
            userid: userid
        }
    });

     if (!review) {
        return res.status(404).json({
            message: "review not found"
        });
    }

    const newone = await prisma.Review.update({
        where : { id : reviewid},
        data : { text}
    })
    return res.status(200).json({message : "review updated"})
}

export const deletereview = async (req,res) => {
    const userid = req.user.id;
    const reviewid = Number(req.params.id);

    const review = await prisma.Review.findFirst({
        where: {
            id: reviewid,
            userid: userid
        }
    });

    if (!review) {
        return res.status(404).json({
            message: "review not found"
        });
    }

    await prisma.Review.delete({
        where: {
            id: reviewid
        }
    });

    return res.status(200).json({
        message: "review deleted"
    });
};

export const getallmyreviews = async (req,res) => {
    const id = req.user.id;
    const {productid} = req.body
    const newone = await prisma.Review.findMany({
       where  : {userid : id , productid}
    })
    return res.status(200).json({message : "got mine",newone})
}

export const getallreviews = async (req,res) => {
    const newone = await prisma.Review.findMany({
    })
    return res.status(200).json({message : "got all",newone})
}

export default prisma;