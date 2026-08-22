import express from "express";
import dotenv from "dotenv";
import MongoDb from "./config/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8001;

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "AURA Auth Service Running"
    });
});

// ✅ CONNECT TO MONGODB FIRST, THEN START SERVER
try {
    await MongoDb();
    app.listen(port, () => {
        console.log(`🚀 SERVER STARTED ON PORT ${port}`);
    });
} catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
}