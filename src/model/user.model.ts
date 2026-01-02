import mongoose, { type HydratedDocument } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export interface IUser {
    _id: string;
    username: string;
    email: string;
    password: string;
    plan: 'free' | 'pro';
    refresh_token?: string | null;
}

interface IUserMethods {
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): Promise<string>;
    generateRefreshToken(): Promise<string>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

export interface CustomRequest extends Request {
    user?: IUser;
}

export interface refreshPayload {
    _id: string
}

export interface accessPayload {
    _id: string
    username: string
    email: string
}

const userSchema = new mongoose.Schema<IUser, {}, IUserMethods>({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    plan: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
    },
    refresh_token: {
        type: String
    }
}, { timestamps: true})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function(): Promise<string> {
    const secret = process.env.ACCESS_TOKEN_SECRET as string;
    const expiry = process.env.ACCESS_TOKEN_EXPIRY as string;

    if (!secret || !expiry) {
        throw new Error("JWT Access Token environment variables are missing");
    }

    // 2. Define the payload
    const payload = {
        _id: this._id,
        username: this.username,
        email: this.email,
    };

    // 3. Use Type Assertion to force the correct Overload
    return jwt.sign(payload, secret as jwt.Secret, {
        expiresIn: expiry
    } as jwt.SignOptions);
}

userSchema.methods.generateRefreshToken = async function(): Promise<string> {
    const secret = process.env.REFRESH_TOKEN_SECRET as string;
    const expiry = process.env.REFRESH_TOKEN_EXPIRY as string;

    if(!secret || !expiry) {
        throw new Error("JWT Refresh token Environment variables not found!")
    }

    const payload = {
        _id: this._id
    }

    return jwt.sign(payload, secret as jwt.Secret, {
        expiresIn: expiry
    } as jwt.SignOptions);
}

export const User = mongoose.model("User", userSchema)