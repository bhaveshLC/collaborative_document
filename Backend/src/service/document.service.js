import Document from "../models/document.model.js";

async function createDocument(createdBy) {
  const document = new Document({
    title: "Document",
    content: "",
    createdBy,
    collaborators: [{ userId: createdBy }],
    versions: [
      {
        content: "",
        modifiedBy: createdBy,
      },
    ],
  });

  await document.save();
  return { docId: document._id };
}
async function getDocuments() {
  const documents = await Document.find().populate(
    "collaborators.userId",
    "name"
  );
  return documents;
}
async function getDocument(docId) {
  const document = await Document.findById(docId)
    .populate("collaborators.userId", "name")
    .populate("versions.modifiedBy", "name email");

  if (!document) {
    const error = new Error("Document does not exists");
    error.statusCode = 404;
    throw error;
  }
  const versions = document.versions || [];
  const lastModifiedBy =
    versions.length > 0 ? versions[versions.length - 1].modifiedBy : null;
  let response = { ...document._doc, lastModifiedBy };
  return response;
}
async function addCollaborator(docId, userId, newCollaborators) {
  if (!docId || !userId || !newCollaborators) {
    const error = new Error("Missing required parameters");
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(newCollaborators)) {
    newCollaborators = [newCollaborators];
  }

  const document = await Document.findOne({
    _id: docId,
    createdBy: userId,
  });

  if (!document) {
    const error = new Error("Document not found or you don't have permission");
    error.statusCode = 404;
    throw error;
  }

  const existingCollaborators = new Map(
    document.collaborators.map((c) => [c.userId.toString(), c])
  );

  const collaboratorsToAdd = newCollaborators
    .map((id) => id.toString())
    .filter((id) => !existingCollaborators.has(id))
    .map((userId) => ({
      userId,
      role: "editor",
      joinedAt: new Date(),
    }));

  if (collaboratorsToAdd.length === 0) {
    return document.collaborators;
  }

  document.collaborators = [...document.collaborators, ...collaboratorsToAdd];

  await document.save();
  return document.collaborators;
}

export const documentService = {
  createDocument,
  getDocuments,
  getDocument,
  addCollaborator,
};
// Hello Team,
// Today I created auth pages, applied socket for real time changes, update the document UI
