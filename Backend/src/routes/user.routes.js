import { Router } from "express";
import { getSelf, getUser, getUsers } from "../controller/user.controller.js";

const router = Router();
router.get("", getUsers);
router.get('/self',getSelf)
router.get("/:userId", getUser);

export { router as userRoute };
