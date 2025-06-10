import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required" });
    }
    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, config.JWT_SECRET);

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: err.message });
  }
}
