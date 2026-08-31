import { getModel } from "../config/llmModels.js";

export const Chatagent = async (state) => {
    console.log("🤖 CHAT AGENT STARTED");
    console.log("💬 CHAT PROMPT:", state.prompt);

    const llm = getModel("chat");

    const response = await llm.invoke([
        {
            role: "system",
            content: "You are Synexa.AI, a helpful assistant.",
        },
        {
            role: "human",
            content: state.prompt,
        },
    ]);

    console.log("🤖 ACTUAL AI RESPONSE:", response.content);

    return {
        ...state,
        aiResponse: response.content,
    };
};