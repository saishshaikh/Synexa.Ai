import express from "express";
import { firebaseLogin } from "../controllers/auth.controller.js";

const router = express.Router();

// ✅ Firebase Login Route
router.post("/firebase-login", firebaseLogin);

export default router;