import mongoose, { Schema, Types } from "mongoose";

const versionSchema = new Schema({
  content: { type: Schema.Types.Mixed },
  htmlContent: { type: String },
  savedAt: { type: Date, default: Date.now },
  modifiedBy: { type: Types.ObjectId, ref: "User", required: true },
});

const collaboratorSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  role: {
    type: String,
    enum: ["owner", "editor"],
    default: "owner",
  },
  joinedAt: { type: Date, default: Date.now },
});

const documentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: Schema.Types.Mixed,
      default: null,
    },
    htmlContent: {
      type: String,
      default: "",
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [collaboratorSchema],
    versions: [versionSchema],
    lastModifiedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ createdBy: 1, updatedAt: -1 });
documentSchema.index({ "collaborators.userId": 1 });
documentSchema.index({ title: "text", htmlContent: "text" }); // Text search
documentSchema.index({ updatedAt: -1 }); // Recent documents

documentSchema.virtual("collaboratorCount").get(function () {
  return this.collaborators.length;
});

documentSchema.methods.hasAccess = function (userId) {
  return (
    this.createdBy.toString() === userId.toString() ||
    this.collaborators.some(
      (collab) => collab.userId.toString() === userId.toString()
    ) ||
    this.isPublic
  );
};

documentSchema.methods.getUserRole = function (userId) {
  if (this.createdBy.toString() === userId.toString()) {
    return "owner";
  }

  const collaborator = this.collaborators.find(
    (collab) => collab.userId.toString() === userId.toString()
  );

  return collaborator ? collaborator.role : this.isPublic ? "viewer" : null;
};

documentSchema.pre("save", function (next) {
  if (this.isModified("content") || this.isModified("title")) {
    this.updatedAt = new Date();
  }
  next();
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
