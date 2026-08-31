import express from "express";
import { agent } from "../controllers/agent.controller.js";

const router = express.Router();

// ✅ Ye route `agent` controller ko call kar raha hai, `graph.invoke` ko nahi!
router.post("/chat", agent);

export default router;