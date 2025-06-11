import { Router } from "express";
import {
  createDocument,
  getDocuments,
  getDocument,
  addCollaborator,
  removeCollaborators,
  getPendingCollaborators,
  getCollaborators,
} from "../controller/document.controller.js";

const router = Router();

router.post("", createDocument);
router.get("", getDocuments);
router
  .get("/:docId", getDocument)
  .get("/:docId/collaborators", getCollaborators)
  .get("/:docId/pending-collaborators", getPendingCollaborators)
  .patch("/:docId/add-collaborators", addCollaborator)
  .patch("/:docId/remove-collaborators", removeCollaborators);

export { router as documentRoute };
