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
            message:"Incorrect Credentials."
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

app.get("/api/v1/content",UserMiddleware,async (req,res)=>{
    // @ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
         // @ts-ignore
        userId: userId
    }).populate("userId","username")
    res.json({
        content
    })

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


app.post("/api/v1/brain/share", UserMiddleware, async (req, res) => {
    const share = req.body.share;
    if (share) {
            const existingLink = await LinkModel.findOne({
                userId: req.userId
            });

            if (existingLink) {
                res.json({
                    hash: existingLink.hash
                })
                return;
            }
            const hash = random(10);
            await LinkModel.create({
                userId: req.userId,
                hash: hash
            })

            res.json({
                hash
            })
    } else {
        await LinkModel.deleteOne({
            userId: req.userId
        });

        res.json({
            message: "Removed link"
        })
    }
})

app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
        hash
    });

    if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        })
        return;
    }
    // userId
    const content = await ContentModel.find({
        userId: link.userId
    })

    console.log(link);
    const user = await UserModel.findOne({
        _id: link.userId
    })

    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        })
        return;
    }

    res.json({
        username: user.username,
        content: content
    })

})

// app.post("/api/v1/brain/share",UserMiddleware,async (req,res)=>{
//     const share = req.body.share;
//     if(share){
//         const existingLink = await LinkModel.findOne({
//             //@ts-ignore
//             userId : req.userId
//         })
//         if(existingLink){
//             res.json({
//                 hash: existingLink.hash
//             })
//             return;
//         }
//             const hash = random(10)
//             await LinkModel.create({
//                 // @ts-ignore
//                 userId : req.userId,
//                 hash : hash
//             })
//             res.json({
//                 message : "/share/"+hash
//             })
       

//     }else{
//         await LinkModel.deleteOne({
//             // @ts-ignore
//             userId : req.userId
//         });
//     }
//     res.json({
//         message : "Updated shareable link"
//     })
// })
// app.get("/api/v1/brain/:shareLink",async (req,res)=>{
//     const hash = req.params.shareLink;
//     const link = await LinkModel.findOne({
//         hash
//     });
//     if(!link){
//         res.status(411).json({
//             message : "Incorrect Input"
//         })
//         return;
//     }else{
//         const content = await ContentModel.find({
//             userId : link.userId
//         })
//     }

//     const user = await UserModel.findOne({
//         userId : link.userId
//     })

//     if(!user){
//         res.status(411).json({
//             message : "User not found!"
//         })
//         return;
//     }

//     res.json({
//         username:user.username,
//         //@ts-ignore
//         content:content
//     })
// })

app.listen(PORT,()=>{
    console.log("App is listening on port: "+PORT);
})