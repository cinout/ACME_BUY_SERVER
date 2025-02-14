import express from "express";
import "dotenv/config";
import routes from "@/routes/index";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "@/db";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import { getAlbumCover } from "./utils/imageSamples";

// Database Setup
connectDB(); // TODO: why I don't need to use await? Top-level 'await' expressions are only allowed when the 'module' option is set to 'es2022', 'esnext', 'system', 'node16', 'nodenext', or 'preserve', and the 'target' option is set to 'es2017' or higher

// Server Setup
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"], //TODO: prod env
    credentials: true, // This allows cookies to be sent in cross-origin requests
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(express.json()); // Parses JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data
app.use(cookieParser());
app.use(graphqlUploadExpress()); // Apply the GraphQL upload middleware before your GraphQL endpoint

// Routing
app.use("/api", routes);

// getAlbumCover(400);

// Listening
const port = process.env.SERVER_PORT;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
