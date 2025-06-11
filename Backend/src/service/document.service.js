import Document from "../models/document.model.js";
import User from "../models/user.model.js";

async function createDocument(createdBy) {
  const document = new Document({
    title: "Document",
    content: "",
    createdBy,
    collaborators: [{ userId: createdBy }],
    // versions: [
    //   {
    //     content: "",
    //     modifiedBy: createdBy,
    //   },
    // ],
  });

  await document.save();
  return { docId: document._id };
}
async function getDocuments(userId) {
  const [ownDocuments, sharedDocuments, publicDocuments] = await Promise.all([
    Document.find({ createdBy: userId }).populate(
      "collaborators.userId",
      "name"
    ),
    Document.find({
      "collaborators.userId": userId,
      createdBy: { $ne: userId },
    }).populate("collaborators.userId", "name"),
    Document.find({
      isPublic: true,
      createdBy: { $ne: userId },
      "collaborators.userId": { $ne: userId },
    }).populate("collaborators.userId", "name"),
  ]);

  return {
    ownDocuments,
    sharedDocuments,
    publicDocuments,
  };
}
async function getDocument(docId) {
  const document = await Document.findById(docId)
    .populate("collaborators.userId", "name")
    .populate("lastModifiedBy", "name email");

  if (!document) {
    const error = new Error("Document does not exists");
    error.statusCode = 404;
    throw error;
  }
  // const versions = document.versions || [];
  // const lastModifiedBy =
  //   versions.length > 0 ? versions[versions.length - 1].modifiedBy : null;
  return document;
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
    return document;
  }

  document.collaborators = [...document.collaborators, ...collaboratorsToAdd];

  await document.save();
  return document;
}
async function removeCollaborators(docId, userId, collaboratorsToRemove) {
  if (!docId || !userId || !collaboratorsToRemove) {
    const error = new Error("Missing required parameters");
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(collaboratorsToRemove)) {
    collaboratorsToRemove = [collaboratorsToRemove];
  }

  const document = await Document.findOne({ _id: docId, createdBy: userId });

  if (!document) {
    const error = new Error("Document not found or you don't have permission");
    error.statusCode = 404;
    throw error;
  }

  const removeSet = new Set(collaboratorsToRemove.map((id) => id.toString()));

  document.collaborators = document.collaborators.filter(
    (c) => !removeSet.has(c._id.toString())
  );
  await document.save();
  return document;
}
async function getCollaborators(docId) {
  const document = await Document.findById(docId).populate(
    "collaborators.userId",
    "name"
  );
  if (!document) {
    const error = new Error("Document not found");
    error.statusCode = 404;
    throw error;
  }
  return document.collaborators;
}
async function getPendingCollaborators(docId, queryObj = {}) {
  const document = await Document.findById(docId);
  if (!document) {
    const error = new Error("Document not found");
    error.statusCode = 404;
    throw error;
  }

  const collaboratorIds = document.collaborators.map((c) =>
    c.userId.toString()
  );

  const query = [];
  if (queryObj.search) {
    query.push(
      { name: { $regex: queryObj.search, $options: "i" } },
      { email: { $regex: queryObj.search, $options: "i" } }
    );
  }

  const userQuery = {
    _id: { $nin: collaboratorIds },
  };

  if (query.length > 0) {
    userQuery.$or = query;
  }

  const nonCollaborators = await User.find(userQuery).select("name email");

  return nonCollaborators;
}

export const documentService = {
  createDocument,
  getDocuments,
  getDocument,
  addCollaborator,
  removeCollaborators,
  getCollaborators,
  getPendingCollaborators,
};
