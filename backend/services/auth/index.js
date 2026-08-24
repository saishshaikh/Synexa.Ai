// backend/services/auth/index.js
import express from "express";
import dotenv from "dotenv";
import MongoDb from "./config/db.js";
import router from "./routes/auth.route.js";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 8001;

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
app.use("/", router);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "AURA Auth Service Running"
    });
});

const startServer = async () => {
    try {
        await MongoDb();
        app.listen(port, () => {
            console.log(`SERVER STARTED ON PORT ${port}`);
        });
    } catch (error) {
        console.error("Server failed to start:", error.message);
        process.exit(1);
    }
};

startServer();