import { Router } from "express";
import {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  addCollaborator,
} from "../controller/document.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("", createDocument);
router.get("", getDocuments);
router.get("/:docId", getDocument).patch("/:docId", addCollaborator);

export { router as documentRoute };
