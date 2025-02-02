import { Schema, model, CallbackError } from "mongoose";
import argon2 from "argon2";

const adminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String },
});

adminSchema.index(
  { email: 1 },
  { collation: { locale: "en", strength: 2 }, unique: true }
); // be case insensitive

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is new or changed

  try {
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id,
    });
    next();
  } catch (err: unknown) {
    next(err as CallbackError);
  }
});

const Admin = model("Admin", adminSchema);
export default Admin;
