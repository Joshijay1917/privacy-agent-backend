import { type Request, type Response, type NextFunction } from "express"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import { User, type accessPayload, type IUser } from "../model/user.model.js";

export const verifyJwt = async(req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        const secert = process.env.ACCESS_TOKEN_SECRET

        if(!token) {
            throw new ApiError(400, "Unauthorized request!!")
        }
    
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, secert!) as accessPayload
        } catch (error: any) {
            if(error.name = 'TokenExpiredError') {
                throw new ApiError(401, "Token expired")
            }
            throw new ApiError(401, "Invalid Access Token")
        }
    
        const user = await User.findById(decodedToken._id).select('-password -refresh_token')
    
        if(!user) {
            throw new ApiError(400, "Invalid Access Token!!")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, "Invalid Access Token middleware error " + error)
    }
}