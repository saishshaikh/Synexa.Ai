import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
  prompt: Annotation(), // ✅ Simple! 
  aiResponse: Annotation(),
  agent: Annotation(),
  ConversationId: Annotation(),
});