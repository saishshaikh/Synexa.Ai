import User from "../models/user.model.js";
import crypto from "crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import redis from "../../../shared/redis.js"; // Path check karein

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

// ============ LOGIN ============
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

    // ✅ Session store in Redis
    // IMPORTANT: Key ko middleware se match karo ("session-") 
    await redis.set(
      `session-${sessionId}`,  // <-- Yahan hyphen (-) use karo, colon (:) nahi
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }),
      'EX',
      7 * 24 * 60 * 60  // 7 days in seconds
    );

    // ✅ Cookie set
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
        name: user.name,       // <-- Yahan name use karo (fullName nahi)
        email: user.email,
        avatar: user.avatar,   // <-- Avatar yahan bhejo!
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

// ============ LOGOUT ============
export const firebaseLogout = async (req, res) => {
  try {
    // ✅ Cookie se sessionId lo
    const sessionId = req.cookies?.session;

    // ✅ Agar session hai toh Redis se delete karo
    if (sessionId) {
      await redis.del(`session-${sessionId}`); // <-- Yahan bhi hyphen (-) use karo
    }

    // ✅ Cookie clear karo
    res.clearCookie("session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error in firebaseLogout:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};