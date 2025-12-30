import { generateContent } from "../services/gemini.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { type Request, type Response } from 'express'
import { asyncHandler } from "../utils/asyncHandler.js";

export const callLLM = asyncHandler(async (req: Request, res: Response) => {
    const { query, history, localTime, model } = req.body

    if (!query || history?.length < 0) {
        throw new ApiError(400, "Query and History is required");
    }

    const limitedHistory = history.length > 50 ? history.slice(-50) : history;
    // console.log("History:", limitedHistory);
    const text = await generateContent({ query, history: limitedHistory, localTime, model })

    if(!text) {
        throw new ApiError(500, "Failed to call LLM!!!")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, text, "Get response successfully!!")
    )
})