import { SellerSignupMethodEnum, SellerStatusEnum } from "@/utils/enums";
import { CallbackError, Schema, model } from "mongoose";
import argon2 from "argon2";

// TODO: for all models, we also need to add validations that are the same in front-end, to enhance security, especially if APIs are allowed to modify items in backend
const sellerSchema = new Schema(
  {
    // Required
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },

    status: {
      type: String,
      enum: Object.values(SellerStatusEnum),
      required: true,
    },
    signupMethod: {
      type: String,
      enum: Object.values(SellerSignupMethodEnum),
      required: true,
    },
    shopName: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageName: { type: String, required: true },

    // Optional
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String },
  },
  { timestamps: true }
);

sellerSchema.index(
  { email: 1 },
  { collation: { locale: "en", strength: 2 }, unique: true }
); // be case insensitive

sellerSchema.pre("save", async function (next) {
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

// Transform _id to id
sellerSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v; // Optional: Remove __v (version key)
  },
});

const Seller = model("Seller", sellerSchema);
export default Seller;
