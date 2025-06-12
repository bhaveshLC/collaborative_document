import { Router } from "express";
import {
  createDocument,
  getDocuments,
  getDocument,
  addCollaborator,
  removeCollaborators,
  getPendingCollaborators,
  getCollaborators,
  getPendingInvitations,
  invitationAction,
} from "../controller/document.controller.js";

const router = Router();

router.post("", createDocument);
router.get("", getDocuments);
router
  .get("/invitations", getPendingInvitations)
  .get("/:docId", getDocument)
  .get("/:docId/collaborators", getCollaborators)
  .get("/:docId/pending-collaborators", getPendingCollaborators)
  .patch("/:docId/add-collaborators", addCollaborator)
  .patch("/:docId/remove-collaborators", removeCollaborators)
  .patch("/:docId/invitation/:action", invitationAction);

export { router as documentRoute };
