import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";

dotenv.config();

const port = process.env.PORT || 8000;

const app = express();

app.use(express.json());

// ✅ Proxy to Auth Service
app.use("/auth", proxy(process.env.AUTH_SERVICE || "http://localhost:8001"));

app.get("/", (req, res) => {
    res.status(200).json({
        message: "✅ Gateway Running",
        port: port
    });
});

app.listen(port, () => {
    console.log("🚀 SERVER STARTED ON PORT " + port);
});