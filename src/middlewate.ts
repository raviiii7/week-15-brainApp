import { NextFunction, Request,Response } from "express";
import { JWT_PASSWORD } from "./config";

import jwt, { decode } from "jsonwebtoken";
export const UserMiddleware = (req : Request,res : Response,next : NextFunction) => {
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header as string,JWT_PASSWORD)
    if(decoded){
        // @ts-ignore
        req.userId = decoded.id;
        next();
    }else{
        res.status(403).json({
            message : "You are not logged in."
        })
    }
}