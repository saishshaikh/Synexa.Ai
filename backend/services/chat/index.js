// backend/services/auth/index.js
import express from "express";
import dotenv from "dotenv";
import MongoDb from "./config/db.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 8001;


app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "chat Service Running"
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