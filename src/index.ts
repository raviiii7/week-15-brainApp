// To remove express error we use  npm install -d @types/express 
import express from "express";
import jwt from "jsonwebtoken";
import { ContentModel, UserModel } from "./db";
import { JWT_PASSWORD } from "./config";
import {UserMiddleware} from "./middlewate"

const app = express();
const PORT = 3000;
// const JWT_PASSWORD="!2323"
app.use(express.json());

app.post("/api/v1/signup",async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;

    await UserModel.create({
        username: username,
        password: password
    })

    res.json({
        message: "User is signed up."
    })
})

app.post("/api/v1/signin",async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const existingUser = await UserModel.findOne({
        username,
        password
    })
    if(existingUser){
        const token = jwt.sign({
            id:existingUser._id
        },JWT_PASSWORD)
        res.json({
            token
        })
    }else{
        res.status(403).json({
            message:"User does not exists."
        })
    }
})

// app.post("/api/v1/signin",(req,res)=>{

// })

app.post("/api/v1/content",UserMiddleware,async (req,res)=>{
    const link = req.body.link;
    const type = req.body.type;
    
    await ContentModel.create({
        link,
        type,
        // @ts-ignore
        userId:req.userId,
        tags:[]
    })
    res.json({
        message : "Content Added."
    })
    
})

app.get("/api/v1/content",(req,res)=>{

})

app.delete("/api/v1/content",(req,res)=>{

})

app.post("/api/v1/brain/share",(req,res)=>{

})
app.get("/api/v1/brain/:shareLink",(req,res)=>{

})

app.listen(PORT,()=>{
    console.log("App is listening on port: "+PORT);
})