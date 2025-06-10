import Document from "./models/document.model.js";
import jwt from "jsonwebtoken";
import { config } from "./config/config.js";

const documentUsers = new Map();
const saveQueue = new Map();

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    let currentDocId = null;
    let currentUserId = null;

    socket.on("join-document", async ({ docId, token }) => {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        currentUserId = decoded._id;
        currentDocId = docId;

        socket.join(docId);

        if (!documentUsers.has(docId)) {
          documentUsers.set(docId, new Map());
        }

        const docUsers = documentUsers.get(docId);
        docUsers.set(currentUserId, {
          userId: currentUserId,
          socketId: socket.id,
          name: decoded.name || "Unknown User",
          joinedAt: new Date(),
        });

        console.log(
          `User ${currentUserId} (${socket.id}) joined document ${docId}`
        );

        const document = await Document.findById(docId)
          .populate("collaborators.userId", "name")
          .populate("lastModifiedBy", "name email")
          .populate("createdBy", "name email");

        if (document) {
          socket.emit("load-document", document);

          socket.to(docId).emit("user-joined", {
            userId: currentUserId,
            name: decoded.name || "Unknown User",
          });

          const activeUsers = Array.from(docUsers.values()).map((user) => ({
            userId: user.userId,
            name: user.name,
            email: user.email,
          }));

          socket.emit("active-users", activeUsers);
        } else {
          socket.emit("error", { message: "Document not found" });
        }
      } catch (error) {
        console.error("Error joining document:", error);
        socket.emit("error", {
          message:
            error.name === "JsonWebTokenError"
              ? "Invalid token"
              : "Authentication failed",
        });
      }
    });

    socket.on("send-changes", ({ docId, delta }) => {
      if (currentDocId === docId) {
        socket.to(docId).emit("receive-changes", delta);
      }
    });

    socket.on("cursor-change", ({ docId, range, userId }) => {
      if (currentDocId === docId && currentUserId === userId) {
        socket.to(docId).emit("cursor-update", { range, userId });
      }
    });

    socket.on(
      "save-document",
      async ({ docId, content, htmlContent, title, token }) => {
        try {
          const decoded = jwt.verify(token, config.JWT_SECRET);
          const userId = decoded._id;

          // Validate that user is in the document
          if (currentDocId !== docId || currentUserId !== userId) {
            socket.emit("error", { message: "Unauthorized access" });
            return;
          }

          // Clear existing timeout for this document
          if (saveQueue.has(docId)) {
            clearTimeout(saveQueue.get(docId));
          }

          const saveTimeout = setTimeout(async () => {
            try {
              const document = await Document.findById(docId);
              if (!document) {
                socket.emit("error", { message: "Document not found" });
                return;
              }

              // Update document fields
              document.content = content;
              document.htmlContent = htmlContent;
              if (title && title.trim()) {
                document.title = title.trim();
              }
              document.lastModifiedBy = userId;
              document.updatedAt = new Date();

              // Add to version history
              document.versions.push({
                content,
                htmlContent,
                modifiedBy: userId,
                savedAt: new Date(),
              });

              if (document.versions.length > 20) {
                document.versions = document.versions.slice(-20);
              }

              await document.save();

              await document.populate("lastModifiedBy", "name email");

              console.log(`Document ${docId} saved by user ${userId}`);

              // Notify all users in the document that it was saved
              io.to(docId).emit("document-saved", {
                lastModifiedBy: document.lastModifiedBy,
                updatedAt: document.updatedAt,
                title: document.title,
              });

              saveQueue.delete(docId);
            } catch (error) {
              console.error("Error saving document:", error);
              socket.emit("error", { message: "Failed to save document" });
            }
          }, 1000); // 1 second debounce

          saveQueue.set(docId, saveTimeout);
        } catch (error) {
          console.error("Error in save-document:", error);
          socket.emit("error", {
            message:
              error.name === "JsonWebTokenError"
                ? "Invalid token"
                : "Authentication failed",
          });
        }
      }
    );

    socket.on("leave-document", ({ docId }) => {
      handleUserLeave(socket, docId, currentUserId);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      if (currentDocId && currentUserId) {
        handleUserLeave(socket, currentDocId, currentUserId);
      }
    });

    function handleUserLeave(socket, docId, userId) {
      if (documentUsers.has(docId)) {
        const docUsers = documentUsers.get(docId);

        if (docUsers.has(userId)) {
          const userInfo = docUsers.get(userId);
          docUsers.delete(userId);

          // Notify other users
          socket.to(docId).emit("user-left", {
            userId: userInfo.userId,
            name: userInfo.name,
          });

          console.log(`User ${userId} left document ${docId}`);

          // Clean up if no users left
          if (docUsers.size === 0) {
            documentUsers.delete(docId);

            // Clear any pending saves
            if (saveQueue.has(docId)) {
              clearTimeout(saveQueue.get(docId));
              saveQueue.delete(docId);
            }
            console.log(
              `Document ${docId} cleanup completed - no active users`
            );
          }
        }
      }

      socket.leave(docId);

      // Reset current document and user
      if (currentDocId === docId) {
        currentDocId = null;
        currentUserId = null;
      }
    }
  });
}

export default socketHandler;
