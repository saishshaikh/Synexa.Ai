import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import protect from "./middleware/auth.middleware.js";
import GetCurrentuser from "./controllers/user.controller.js"; // <-- Yahan se { } hataye

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(
  "/auth",
  proxy(process.env.AUTH_SERVICE || "http://localhost:8001")
);

app.get("/me", protect, GetCurrentuser);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Gateway Running",
    port
  });
});

app.listen(port, () => {
  console.log("SERVER STARTED ON PORT " + port);
});