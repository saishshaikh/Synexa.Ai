import { StateGraph } from "@langchain/langgraph";
import { AgentState } from "./state.js";
import { router } from "./router.js";
import { Chatagent } from "../agents/chat.agent.js";
import { searchAgent } from "../agents/search.agent.js";
import { coddingAgent } from "../agents/codding.agent.js";
import { imageGenAgent } from "../agents/imageGen.agent.js";
import { pptAgent } from "../agents/ppt.agent.js";
import { pdfAgent } from "../agents/pdf.agent.js";

const workflow = new StateGraph(AgentState);

workflow.addNode("router", router);
workflow.addNode("chat", Chatagent);
workflow.addNode("search", searchAgent);
workflow.addNode("codding", coddingAgent);
workflow.addNode("imageGen", imageGenAgent);
workflow.addNode("ppt", pptAgent);
workflow.addNode("pdf", pdfAgent);

workflow.addEdge("__start__", "router");

workflow.addConditionalEdges(
    "router",
    (state) => {
        switch (state.agent) {
            case "chat": return "chat";
            case "search": return "search";
            case "codding": return "codding";
            case "imageGen": return "imageGen";
            case "ppt": return "ppt";
            case "pdf": return "pdf";
            default: return "chat";
        }
    },
    {
        chat: "chat",
        search: "search",
        codding: "codding",
        imageGen: "imageGen",
        ppt: "ppt",
        pdf: "pdf"
    }
);

workflow.addEdge("search", "chat");
workflow.addEdge("chat", "__end__");
workflow.addEdge("codding", "__end__");
workflow.addEdge("imageGen", "__end__");
workflow.addEdge("ppt", "__end__");
workflow.addEdge("pdf", "__end__");

export default workflow.compile();