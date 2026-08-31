import axios from "axios";
import graph from "../graph/graph.js";

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId } = req.body;

    // 1. User ka message save karo
    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
    });

    // 2. LangGraph invoke karo (YEH LINE SABSE IMPORTANT HAI - req nahi, state bhejo)
    const result = await graph.invoke({
      prompt,
      conversationId,
    });

    // 3. AI ka response extract karo
    const response = result.aiResponse;

    // 4. AI (assistant) ka message bhi save karo (YEH TUTORIAL WALA ADD KIYA HAI)
    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "assistant",
      content: response,
    });

    // 5. Response wapas bhejo
    return res.status(200).json(response);
  } catch (error) {
    console.error("❌ Agent Error:", error);
    return res.status(500).json({ message: "agent error" });
  }
};