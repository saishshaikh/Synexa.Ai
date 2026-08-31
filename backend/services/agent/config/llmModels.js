import "dotenv/config";

import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const groq = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-120b",
});

export const gemini = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.5-flash",
});

export const defaultModel = groq;

export const getModel = (type) => {
    switch (type) {
        case "chat":
            return groq;

        case "search":
            return groq;

        case "coding":
            return groq;

        case "pdf":
            return groq;

        case "ppt":
            return groq;

        case "vision":
            return gemini;

        default:
            return groq;
    }
};