import express from "express";
import "dotenv/config";
import { config } from "./config/config.js";
import { connectToDB } from "./config/connection.js";
import { errorHandler } from "./utils/errorHandler.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import { authRoute } from "./routes/auth.routes.js";
import { userRoute } from "./routes/user.routes.js";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import socketHandler from "./socket.js";
import { documentRoute } from "./routes/document.routes.js";
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

connectToDB(config.MongoDB_URL);
app.use("/auth", authRoute);
app.use("/user", authMiddleware, userRoute);
app.use("/document", authMiddleware, documentRoute);
app.use(errorHandler);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
socketHandler(io);

export default server;
