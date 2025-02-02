import { SellerSignupMethodEnum, SellerStatusEnum } from "@/utils/enums";
import { CallbackError, Schema, model } from "mongoose";
import argon2 from "argon2";

const sellerSchema = new Schema(
  {
    // Required
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },

    status: {
      type: String,
      enum: [
        SellerStatusEnum.Active,
        SellerStatusEnum.Deactivated,
        SellerStatusEnum.Pending,
      ],
      required: true,
    },
    signupMethod: {
      type: String,
      enum: [
        SellerSignupMethodEnum.Default,
        SellerSignupMethodEnum.Facebook,
        SellerSignupMethodEnum.Google,
      ],
      required: true,
    },

    // Optional
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String },

    image: { type: String },
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

const Seller = model("Seller", sellerSchema);
export default Seller;
