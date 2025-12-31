import { ai } from "../config/gemini.js";
import type { GeminiQuery } from "../types/geminiQuery.js";

const SYSTEM_INSTRUCTIONS = {
    NOTIFICATION: `
        ## Continuity Ledger
        Maintain a brief internal 'ledger' of the user's current goal to survive context gaps.
        - At the start of every turn, recall the user's primary intent from the history.
        - Ensure all advice remains strictly private and local-first.

        ### Job Description
        You are the Privacy Agent. You have two jobs:
        1. Politely Answer any general questions the user asks.
        2. If the user wants to set a reminder/notification, you must collect: "time" (HH:mm), "topic", "frequency", and "message".

        ### STRICT OUTPUT FORMAT (JSON ONLY)
        {
          "status_check": "1-sentence summary of the current goal",
          "reply": "Your answer to their question in markdown",
          "notification": null | { "time": "string", "topic": "string", "frequency": "DAILY"|"ONCE", "message": "string" },
          "privacy_ledger": "Confirmation that data is processed locally/anonymously"
        }

        **LOGIC:**
        - If details are missing for a reminder, ask for them in "reply".
        - populate "notification" ONLY when ALL details are present.
        - Every response MUST be valid JSON. No prose outside the JSON.
    `
};

export async function generateContent({ query, history, localTime, model }: GeminiQuery) {
    const isGemma = model.includes('gemma');
    try {
        const chat = ai.chats.create({
            model: model,
            config: {
                ...(!isGemma && {systemInstruction: `${SYSTEM_INSTRUCTIONS.NOTIFICATION}
                IMPORTANT CONTEXT:
                Current Local Time: ${localTime}
                Focus ONLY on the current query while respecting the Continuity Ledger.`}),
                ...( !isGemma && { responseMimeType: 'application/json' }),
            },
            history: history.map((msg, index) => {
                let content = msg.content;
                if (isGemma && index === 0) {
                    content = `INSTRUCTIONS:\n${SYSTEM_INSTRUCTIONS.NOTIFICATION}\nLocal Time: ${localTime}\n\nUSER MESSAGE:\n${msg.content}`;
                }
                return {
                    role: msg.role,
                    parts: [{ text: msg.content }]
                }
            })
        })
        const res = await chat.sendMessage({
            message: query
        });

        const rawText = res.text;
        const jsonMatch = rawText?.match(/\{(?:[^{}]|(\{(?:[^{}]|(\{[^{}]*\})) *\}))*\}/); // Extracts the first { ... } block found
        const cleanText = !isGemma && jsonMatch ? jsonMatch[0] : rawText;

        try {
            const parsed = JSON.parse(cleanText || '{reply: null, notification: null, status: AI is warmed UP!}');
            return {
                reply: parsed.reply,
                notification: parsed.notification,
                status: parsed.status_check
            };
        } catch (e) {
            return { reply: res.text, notification: null, status: "Online (Standard Mode)" };
        }
    } catch (error) {
        console.error("Failed to call LLM!!", error)
    }
}