import { Schema, model, CallbackError } from "mongoose";
import argon2 from "argon2";

const adminSchema = new Schema({
  // Required
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  imageUrl: { type: String, required: true },
  imageName: { type: String, required: true },
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

adminSchema.set("toJSON", {
  virtuals: true, // include virtual fields, which are not stored in MongoDB but computed on the fly.
  transform: (doc, ret) => {
    // doc:  The raw Mongoose document.
    // ret:  The plain JSON object that will be returned.
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v; // Optional: Remove __v (version key)
  },
});

const Admin = model("Admin", adminSchema);
export default Admin;
