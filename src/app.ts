import express from "express";
import routes from "@/routes/index";
import cors from "cors";
import cookieParser from "cookie-parser";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import connectDB from "@/db";
import { unknownEndpoint } from "./utils/middleware";

// Database Setup
await connectDB();

// Server Setup
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"], //TODO:[3] prod env
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

// middlewares (After Routing)
app.use(unknownEndpoint);

// TODO:[2] custom error handler?

export default app;
