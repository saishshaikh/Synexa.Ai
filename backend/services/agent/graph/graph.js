import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router } from "./router.js";
import { Chatagent } from "../agents/chat.agent.js";
import { searchAgent } from "../agents/search.agent";
import { coddingAgent } from "../agents/codding.agent";
import { imageGenAgent } from "../agents/imagegen.agent";
import { pptAgent } from "../agents/ppt.agent.js";
import { pdfAgent } from "../agents/pdf.agent";


const workflow= new StateGraph(agentState)
workflow.addNode("router",router)
workflow.addNode("chat",Chatagent)
workflow.addNode("search",searchAgent)
workflow.addNode("codding",coddingAgent)
workflow.addNode("image",imageGenAgent)
workflow.addNode("ppt",pptAgent)
workflow.addNode("pdf",pdfAgent)


workflow.addEdge("__start__","router")
workflow.addConditionalEdges("router")