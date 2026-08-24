import User from "../models/user.model.js"; // ✅ SAHI PATH
import crypto from "crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ serviceAccountKey.json file se Firebase Admin Initialize
if (!getApps().length) {
  initializeApp({
    credential: cert(
      JSON.parse(
        readFileSync(path.join(__dirname, "../serviceAccountKey.json"), "utf-8")
      )
    ),
  });
}

export const firebaseLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const decoded = await getAuth().verifyIdToken(token);

    const { uid, name, email, picture } = decoded;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        name: name || "Firebase User",
        email: email || "",
        avatar: picture || "",
        role: "user",
      });
    }

    const sessionId = crypto.randomUUID();

    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Firebase login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in firebaseLogin:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid Firebase token",
    });
  }
};