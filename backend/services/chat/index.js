import express from "express";
import dotenv from "dotenv";
import MongoDb from "./config/db.js";
import chatRouter from "./routes/chat.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8002;

app.use(express.json());

app.use("/", chatRouter);

app.get("/chat", (req, res) => {
  res.status(200).json({
    message: "Chat Service Running",
  });
});

const startServer = async () => {
  try {
    await MongoDb();

    app.listen(port, () => {
      console.log(`CHAT SERVICE STARTED ON PORT ${port}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();