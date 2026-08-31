import express from "express";
import dotenv from "dotenv";
import MongoDb from "./config/db.js";
import graph from "./graph/graph.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8003;

app.use(express.json());

app.post("/chat", async (req, res) => {
    try {
        console.log("====================================");
        console.log("📥 CHAT REQUEST");
        console.log("📦 BODY:", req.body);

        const { prompt, conversationId } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: "Prompt is required",
            });
        }

        const state = {
            prompt: prompt.trim(),
            conversationId,
        };

        console.log("🧠 GRAPH STATE:", state);

        // 🔥 IMPORTANT: router() nahi, graph.invoke()
        const result = await graph.invoke(state);

        console.log("🤖 FINAL GRAPH RESULT:");
        console.dir(result, { depth: null });

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error("❌ CHAT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

app.get("/", (req, res) => {
    res.json({
        message: "Agent Service Running",
    });
});

const startServer = async () => {
    try {
        await MongoDb();

        app.listen(port, () => {
            console.log(`🚀 AGENT SERVICE STARTED ON PORT ${port}`);
        });
    } catch (error) {
        console.error("Server failed to start:", error);
        process.exit(1);
    }
};

startServer();