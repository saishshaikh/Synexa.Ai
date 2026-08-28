import { Annotation } from "@langchain/langgraph";
import Conversation from "../../chat/models/conversation.model";

  export const agentState = Annotation.Root({
    prompt : Annotation(),
    AiResponse : Annotation(),
    agent :Annotation(),
    ConversationId:Annotation()
  })
