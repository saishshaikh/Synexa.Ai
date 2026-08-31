import axios from "axios";
import graph from "../graph/graph.js";

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId } = req.body;

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
    });

    // ⚠️ Yahan SIRF state bhejo, `req` kabhi nahi!
    const result = await graph.invoke({
      prompt,
      conversationId,
    });

    return res.status(200).json(result.aiResponse);
  } catch (error) {
    console.error("❌ Agent Error:", error); // ✅ Error log karo!
    return res.status(500).json({ message: "agent error" });
  }
};