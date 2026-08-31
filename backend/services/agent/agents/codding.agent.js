import { getModel } from "../config/llmModels.js";

export const coddingAgent = async (state) => {
    console.log("💻 CODING AGENT STARTED");

    const llm = getModel("chat");

    const response = await llm.invoke([
        {
            role: "system",
            content: "You are Synexa.AI coding assistant.",
        },
        {
            role: "human",
            content: state.prompt,
        },
    ]);

    console.log("💻 CODING AI RESPONSE:", response.content);

    return {
        ...state,
        aiResponse: response.content,
    };
};