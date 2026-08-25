import express from "express";
import { firebaseLogin, firebaseLogout } from "../controllers/auth.controller.js";

const router = express.Router();

// ✅ Firebase Login Route
router.post("/firebase-login", firebaseLogin);
router.post("/firebase-logout", firebaseLogout);


export default router;