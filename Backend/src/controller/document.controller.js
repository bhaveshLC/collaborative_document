import { documentService } from "../service/document.service.js";

export async function createDocument(req, res) {
  const userId = req.user._id;
  const document = await documentService.createDocument(userId);
  res.status(200).json({ status: "success", statusCode: 200, data: document });
}
export async function getDocuments(req, res) {
  const userId = req.user._id;
  const documents = await documentService.getDocuments(userId);
  res.status(200).json({ status: "success", statusCode: 200, data: documents });
}
export async function getDocument(req, res) {
  const { docId } = req.params;
  const document = await documentService.getDocument(docId);
  res.status(200).json({ status: "success", statusCode: 200, data: document });
}

export async function updateDocument(req, res) {
  const { docId } = req.params;
  const updatedDocument = await documentService.updateDocument(docId, req.body);
  res
    .status(200)
    .json({ status: "success", statusCode: 200, data: updatedDocument });
}

export async function addCollaborator(req, res) {
  const { docId } = req.params;
  const userId = req.user._id;
  const document = await documentService.addCollaborator(
    docId,
    userId,
    req.body
  );
  res.status(201).json({ status: "success", statusCode: 201, data: document });
}
export async function removeCollaborators(req, res) {
  const { docId } = req.params;
  const userId = req.user._id;
  const { collaborators } = req.body;
  const document = await documentService.removeCollaborators(
    docId,
    userId,
    collaborators
  );
  res.status(201).json({ status: "success", statusCode: 200, data: document });
}
export async function getCollaborators(req, res) {
  const { docId } = req.params;
  const collaborators = await documentService.getCollaborators(docId);
  res
    .status(200)
    .json({ status: "success", statusCode: 200, data: collaborators });
}
export async function getPendingCollaborators(req, res) {
  const { docId } = req.params;
  const pendingCollaborators = await documentService.getPendingCollaborators(
    docId,
    req.query
  );
  res
    .status(201)
    .json({ status: "success", statusCode: 200, data: pendingCollaborators });
}
