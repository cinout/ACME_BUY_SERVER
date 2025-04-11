import config from "@/utils/config";
import mongoose from "mongoose";

// TODO:[3] a test database for test environment
const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? `mongodb://127.0.0.1:${config.DATABASE_PORT}/${config.DATABASE_NAME_TEST}`
    : process.env.NODE_ENV === "production"
    ? `mongodb://127.0.0.1:${config.DATABASE_PORT}/${config.DATABASE_NAME_PROD}`
    : `mongodb://127.0.0.1:${config.DATABASE_PORT}/${config.DATABASE_NAME_DEV}`;

const connectDB = async () => {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection;
  db.once("open", () => console.log("Database connected successfully!"));
  db.on("error", console.error.bind(console, "Database connection error:"));
};

export default connectDB;
