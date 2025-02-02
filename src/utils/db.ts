import mongoose from "mongoose";

const db_port = process.env.DATABASE_PORT;
const db_name = process.env.DATABASE_NAME;
const connectDB = async () => {
  await mongoose.connect(`mongodb://127.0.0.1:${db_port}/${db_name}`);
  const db = mongoose.connection;
  db.once("open", () => console.log("Database connected successfully!"));
  db.on("error", console.error.bind(console, "Database connection error:"));
};

export default connectDB;
