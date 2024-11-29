// To remove express error we use  npm install -d @types/express 
import express from "express";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db";
import { JWT_PASSWORD } from "./config";
import {UserMiddleware} from "./middlewate"
import { random } from "./utils";

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

app.get("/api/v1/content",async (req,res)=>{
    // @ts-ignore
    const usetId = req.userId;
    const content = await ContentModel.find({
         // @ts-ignore
        userId: userId
    })
    res.json({content})

})

app.delete("/api/v1/content",UserMiddleware, async (req,res)=>{
    const contentId = req.body.contentId;
     await ContentModel.deleteMany({
        contentId,
        // @ts-ignore
        userId : req.userId
     })

     res.json({
        message : "deleted"
     })
})

app.post("/api/v1/brain/share",UserMiddleware,async (req,res)=>{
    const share = req.body.share;
    if(share){
        await LinkModel.create({
            // @ts-ignore
            userId : req.userId,
            hash : random(10)
        })
    }else{
        await LinkModel.deleteOne({
            // @ts-ignore
            userId : req.userId
        });
    }
    res.json({
        message : "Updated shareable link"
    })
})
app.get("/api/v1/brain/:shareLink",async (req,res)=>{
    const hash = req.params.shareLink;
    const link = await LinkModel.findOne({
        hash
    });
    if(!link){
        res.status(411).json({
            message : "Incorrect Input"
        })
        return;
    }else{
        const content = await ContentModel.find({
            userId : link.userId
        })
    }

    const user = await UserModel.findOne({
        userId : link.userId
    })
    
    if(!user){
        res.status(411).json({
            message : "User not found"
        })
        return;
    }

    res.json({
        username:user.username,
        content:content
    })
})

app.listen(PORT,()=>{
    console.log("App is listening on port: "+PORT);
})