import mongoose from "mongoose";

// Database Setup
const port = 27017;
const name = "acme_buy";
const seedingScriptConnectDB = async () => {
  await mongoose.connect(`mongodb://127.0.0.1:${port}/${name}`);
  const db = mongoose.connection;
  db.once("open", () => console.log("Database connected successfully!"));
  db.on("error", console.error.bind(console, "Database connection error:"));
};

export default seedingScriptConnectDB;
