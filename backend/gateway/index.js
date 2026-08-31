
// gateway/index.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import protect from "./middleware/auth.middleware.js";
import GetCurrentuser from "./controllers/user.controller.js";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(morgan("dev"));

// ==========================================
// AUTH SERVICE
// ==========================================

app.use(
  "/api/auth",
  proxyWithHeader(
    process.env.AUTH_SERVICE || "http://localhost:8001"
  )
);

// ==========================================
// CHAT SERVICE
// ==========================================

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

// ==========================================
// CONVERSATION SERVICE
// ==========================================

app.use(
  "/api/conversations",
  protect,
  proxyWithHeader(
    process.env.CHAT_SERVICE || "http://localhost:8002",
    {
      proxyReqPathResolver: (req) => {
        return `/conversations${req.url}`;
      },
    }
  )
);

// ==========================================
// AGENT SERVICE
// ==========================================

app.use(
  "/api/agent",
  protect,
  proxyWithHeader(
    process.env.AGENT_SERVICE || "http://localhost:8003",
    {
      proxyReqPathResolver: (req) => {
        return req.url;
      },

      timeout: 120000,
      proxyTimeout: 120000,

      on: {
        proxyReq: (proxyReq, req) => {
          console.log("➡️ Gateway → Agent");
          console.log("Method:", req.method);
          console.log("URL:", req.url);
          console.log("User:", req.user?.userId);

          if (req.user?.userId) {
            proxyReq.setHeader("x-user-id", req.user.userId);
          }
        },

        proxyRes: (proxyRes, req) => {
          console.log(
            "⬅️ Agent → Gateway:",
            proxyRes.statusCode,
            req.url
          );
        },

        error: (err, req) => {
          console.error("❌ Agent proxy error:", err.message);
          console.error("URL:", req.url);
        },
      },
    }
  )
);

// ==========================================
// JSON BODY PARSER
// ==========================================

// Keep this AFTER proxy routes
app.use(express.json());

// ==========================================
// CURRENT USER
// ==========================================

app.get("/api/me", protect, GetCurrentuser);

// ==========================================
// GATEWAY HEALTH
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gateway Running",
    port,
  });
});

// ==========================================
// START
// ==========================================

app.listen(port, () => {
  console.log(`🚀 GATEWAY STARTED ON PORT ${port}`);
});

