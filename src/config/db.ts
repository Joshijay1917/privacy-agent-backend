import mongoose from "mongoose";

export const connectToDB = async() => {
    try {
        const connectionInterface = await mongoose.connect(`${process.env.MONGO_URI}/privacyagent`)
        console.log("Connected to database host!! ", connectionInterface.connection.host)
    } catch (error) {
        console.error("Failed to connect to database!! Error:", error)
        process.exit(1)
    }
}