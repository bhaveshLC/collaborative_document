import { Router } from "express";
import { authController } from "../controller/auth.controller.js";

const router = Router();
router.post("/login", authController.Login);
router.post("/signup", authController.Register);

export { router as authRoute };
