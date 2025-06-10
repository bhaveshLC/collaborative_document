import { documentService } from "../service/document.service.js";

export async function createDocument(req, res) {
  const userId = req.user._id;
  const document = await documentService.createDocument(userId);
  res.status(200).json({ status: "success", statusCode: 200, data: document });
}
export async function getDocuments(req, res) {
  const documents = await documentService.getDocuments();
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
  const { collaborators } = req.body;
  const collaboratorList = await documentService.addCollaborator(
    docId,
    userId,
    collaborators
  );
  res
    .status(201)
    .json({ status: "success", statusCode: 201, data: collaboratorList });
}
