import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import protect from "./middleware/auth.middleware.js";
import GetCurrentuser from "./controllers/user.controller.js";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";

dotenv.config();

const port = process.env.PORT || 8000;

const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Auth Service
app.use(
  "/api/auth",
  proxy(process.env.AUTH_SERVICE || "http://localhost:8001")
);

// Chat Service
app.use(
  "/api/chat",
  protect,
  proxyWithHeader(
    process.env.CHAT_SERVICE || "http://localhost:8002",
    {
      proxyReqPathResolver: (req) => req.url,
    }
  )
);

// Conversations
app.use(
  "/api/conversations",
  protect,
  proxyWithHeader(
    process.env.CHAT_SERVICE || "http://localhost:8002",
    {
      proxyReqPathResolver: (req) => `/conversations${req.url}`,
    }
  )
);

// Agent Services
app.use(
  "/api/agent",
  protect,
  proxyWithHeader(
    process.env.AGENT_SERVICE || "http://localhost:8003"
  )
);

// Current User
app.get("/api/me", protect, GetCurrentuser);

// Gateway health check
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Gateway Running",
    port,
  });
});

// Start server
app.listen(port, () => {
  console.log(`SERVER STARTED ON PORT ${port}`);
});