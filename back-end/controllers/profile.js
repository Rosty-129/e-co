import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const getprofile = async (req,res) => {
    const userid = req.user.id;
    const all = await prisma.User.findUnique({
        where : {id : userid}, select : {email : true , firstname : true , lastname : true , phone : true}
    })
    if(!all){
        return res.status(400).json({message : "user not found"})
    }
    return res.status(200).json({message : "user found",all})
}
export const updateprofile = async (req,res) => {
    const userid = req.user.id;
    const { email, firstname, lastname, phone } = req.body;
    const all = await prisma.User.update({
        where : {id : userid}, data : {email , firstname , lastname ,phone}
    })
    if(!all){
        return res.status(400).json({message : "user not found"})
    }
    return res.status(200).json({message : "user updated"})
}

export const changepassword = async (req,res)=>{

 const userid = req.user.id;
 const { oldpassword , newpassword } = req.body

 const all = await prisma.User.findUnique({
        where : {id : userid}
    })

if(!all){
        return res.status(400).json({message : "user not found"})
    }

    const istrue = await bcrypt.compare(oldpassword , all.password);

    if(!istrue){
        return res.status(400).json({message : "password not the same"})
    }
     
 const newpasswordfr = await bcrypt.hash(newpassword , 10)

const updatedpassword = await prisma.User.update({
    where : {id : userid} , data : {password : newpasswordfr}
})

    return res.status(200).json({message : "password updated"})

}

export default prisma;