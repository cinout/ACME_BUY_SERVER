import { db_name, db_port } from "@/utils/config";
import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(`mongodb://127.0.0.1:${db_port}/${db_name}`);
  const db = mongoose.connection;
  db.once("open", () => console.log("Database connected successfully!"));
  db.on("error", console.error.bind(console, "Database connection error:"));
};

export default connectDB;
