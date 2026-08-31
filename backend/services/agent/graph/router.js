import { groq } from "../config/llmModels.js";

export const router = async (state) => {
    console.log("====================================");
    console.log("🧭 ROUTER STARTED");

    console.dir(state, { depth: null });

    const prompt = state?.prompt?.trim();

    console.log("🧭 ROUTER INPUT:", prompt);

    if (!prompt) {
        throw new Error("Router received empty prompt");
    }

    const systemPrompt = `
You are an agent router.

Available agents:

- chat
- search
- coding
- pdf
- ppt
- vision

Rules:

chat:
General conversation, explanations, learning, questions.

search:
Current events, latest information, news, recent developments, internet lookup.

coding:
Generate code, debug code, build projects, architecture, API design.

pdf:
Questions about generating PDFs or PDF document context.

ppt:
Questions about generating PPTs or PPT context.

vision:
Questions about images, image analysis, or visual content.

User Query:
${prompt}

Return ONLY one word:

chat
search
coding
pdf
ppt
vision
`;

    const response = await groq.invoke(systemPrompt);

    const selectedAgent = response.content
        ?.trim()
        .toLowerCase();

    console.log("🧭 ROUTER RAW RESPONSE:", response);
    console.log("🧭 SELECTED AGENT:", selectedAgent);

    return {
        ...state,
        agent: selectedAgent,
    };
};