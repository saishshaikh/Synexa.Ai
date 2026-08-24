// backend/gateway/index.js
import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const port = process.env.PORT || 8000;

const app = express();

// ✅ MANUAL CORS HEADERS (100% GUARANTEED)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
    
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});

app.use(express.json());
app.use(cookieParser());

app.use("/auth", proxy(process.env.AUTH_SERVICE || "http://localhost:8001"));

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Gateway Running",
        port: port
    });
});

app.listen(port, () => {
    console.log("SERVER STARTED ON PORT " + port);
});