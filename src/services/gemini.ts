import { ai } from "../config/gemini.js";
import type { GeminiQuery } from "../types/geminiQuery.js";

const SYSTEM_INSTRUCTIONS = {
    // We update the NOTIFICATION prompt to be "Hybrid"
    NOTIFICATION: `
        You are the Privacy Agent. You have two jobs:
        1. Politely Answer any general questions the user asks.
        2. If (and only if) the user wants to set a reminder/notification, here it is a tool notification with details needed: "time" (HH:mm), "topic", "frequency", and "message".

        **STRICT OUTPUT FORMAT:**
        You must ALWAYS respond in JSON:
        {
          "reply": "Your answer to their question OR your request for notification details",
          "notification": null | { "time": "string", "topic": "string", "frequency": "DAILY"|"ONCE", "message": "string" }
        }

        **LOGIC:**
        - If the user asks a general question (e.g., about the app creator), respond in "reply" and set "notification" to null.
        - If the user asks to set a reminder but does NOT provide all required details, ask for the missing details in "reply" and set "notification" to null.
        - If the user clearly provides ALL required details, confirm briefly in "reply" and populate the "notification" object.
        - NEVER assume or invent missing details.
        - NEVER create a notification unless the user explicitly wants one.

        FINAL CONSTRAINT:
        - Every response MUST be exactly one valid JSON object matching the schema above.
        - Any output outside this format is considered invalid.
    `
};

export async function generateContent({ query, history, localTime, model }: GeminiQuery) {
    try {
        const chat = ai.chats.create({
            model: model,
            config: {
                systemInstruction: `${SYSTEM_INSTRUCTIONS.NOTIFICATION}
                IMPORTANT CONTEXT:
                ${localTime}
                Use this to calculate relative times (e.g., 'in 1 hour' or 'tomorrow').`,
                responseMimeType: 'application/json'
            },
            history: history.map((msg) => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }))
        })
        const res = await chat.sendMessage({
            message: query
        });
        try {
            return JSON.parse(res.text || '{ reply: null, notification: null }');
        } catch (e) {
            // Fallback if LLM returns non-JSON text
            return { reply: res.text, notification: null };
        }
    } catch (error) {
        console.error("Failed to call LLM!!", error)
    }
}