import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createimage = async (req,res) => {
  const {url} = req.body
  const { id } = req.params

 const photo = await prisma.ProductPhoto.create({
    data : {url, productid : Number(id)}
  })

  return res.status(200).json({message : "photo added"});
}
export const deleteimage = async (req,res) => {
  const { id } = req.params

 const photo = await prisma.ProductPhoto.delete({
    where : {id : Number(id)}
  })

  return res.status(200).json({message : "photo deleted"});
}

export default prisma