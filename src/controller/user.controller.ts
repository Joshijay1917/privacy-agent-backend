import { User, type CustomRequest, type IUser, type refreshPayload, type UserDocument } from "../model/user.model.js";
import { type Response } from 'express'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

interface options {
    httpOnly: boolean,
    secure: boolean,
    sameSite: 'strict' | 'lax' | 'none';
}

const generateAccessRefreshTokens = async (userId: string) => {
    try {
        const user = await User.findById(userId) as UserDocument | null;

        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refresh_token = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error: any) {
        throw new ApiError(500, "Error while generating access and refresh Tokens!" + error)
    }
}

const registerUser = asyncHandler(async (req, res) => {
    /*
        -Get all fields from body
        -check if any required field missing than throw error
        -check email and phone number
        -check if user already exists
        -save user in database
        -send response

        "username": "jay",
        "password": "Jay191",
        "phone": "9106052826",
        "email": "Jay@gmail.com",
        "sem": 2,
        "branch": "CE",
        "year": 2
    */

    const { username, password, email } = req.body

    if (username === '' || password === '' || email === '') {
        throw new ApiError(400, "Cannot get required fields!");
    }

    if (!email.includes('@') || !email.includes('.')) {
        throw new ApiError(400, "Please Enter Valid Email");
    }

    const existUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existUser) {
        throw new ApiError(400, "User already registered!!")
    }

    const user = await User.create({
        username,
        email,
        password
    })

    if (!user) {
        throw new ApiError(500, "Failed to register user!!")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, user, "User registered successfully!!")
        )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, "Username and password is required")
    }

    const user = await User.findOne<UserDocument>({ email })

    if (!user) {
        throw new ApiError(400, "User does not exists")
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "Password is not valid");
    }

    const { accessToken, refreshToken } = await generateAccessRefreshTokens(user._id)

    const options: options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }

    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user, accessToken, refreshToken }, "User LoggedIn Successfully")
        )
})

const currentUser = asyncHandler(async (req: any, res: Response) => {
    res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "User get successfully")
        )
})

const refreshToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken
    const secret = process.env.REFRESH_TOKEN_SECRET

    console.log("Cookies=", req.cookies);


    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized request!!!")
    }

    if(!secret) {
        throw new ApiError(500, "No env variables found: user controller refreshtoken()")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, secret) as refreshPayload

        const user = await User.findById(decodedToken._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== user.refresh_token) {
            throw new ApiError(401, "RefreshToken is expired or used")
        }

        const options: options = {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }

        const { refreshToken, accessToken } = await generateAccessRefreshTokens(decodedToken._id);

        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { user, accessToken, refreshToken }, "Tokens refreshed successfully")
            )
    } catch (error) {
        throw new ApiError(400, "Token is Invalid " + error)
    }
})

const logoutUser = async (req: any, res: Response) => {
    try {
        const user = req.user as IUser;
    
        const existUser = await User.findById<UserDocument>(user._id)
        if (!existUser) {
            throw new ApiError(400, "User does not exists!")
        }
    
        existUser.refresh_token = null;
        await existUser.save();
    
        const options: options = {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }
    
        res.clearCookie('accessToken', options);
        res.clearCookie('refreshToken', options);
    
        return res.status(200).json(
            new ApiResponse(200, {}, "Logged out successfully")
        );
    } catch (error) {
        throw new ApiError(500, 'Failed to logout user')
    }
}

export {
    registerUser,
    loginUser,
    currentUser,
    refreshToken,
    logoutUser
}