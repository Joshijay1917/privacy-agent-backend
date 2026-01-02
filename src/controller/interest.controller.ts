import { Interest } from "../model/interest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const saveInterest = asyncHandler(async (req, res) => {
    const { message, email } = req.body
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER
    console.log({ message, email });

    if (!message || !email) {
        throw new ApiError(400, "Message and Email is required!")
    }

    await Interest.create({
        message: message,
        email: email
    })

    const Message = await client.messages.create({
        body: `Premium Feature!!!!!

            Email: ${email}
            Message: ${message}`,
        from: phoneNumber!,
        to: "+919106052826",
    });

    if (!Message) {
        throw new ApiError(500, "Failed to sent message")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Response saved successfully!")
        )
})

export { saveInterest }