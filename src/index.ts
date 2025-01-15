import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import routes from "@/routes/index";
import cors from "cors";
import cookieParser from "cookie-parser";

// Database Setup
const db_port = process.env.DATABASE_PORT;
const db_name = process.env.DATABASE_NAME;
mongoose.connect(`mongodb://127.0.0.1:${db_port}/${db_name}`);
const db = mongoose.connection;
db.once("open", () => console.log("MongoDB connected successfully!"));
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Server Setup
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"], //TODO: prod env
    credentials: true, // TODO: what is it?
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(express.json()); // Parses JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data
app.use(cookieParser());

// Routing
app.use("/api", routes);

// Listening
const port = process.env.SERVER_PORT;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
