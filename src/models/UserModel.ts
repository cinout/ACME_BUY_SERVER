import { RoleEnum, UserSignupMethodEnum, UserStatusEnum } from "@/utils/enums";
import { CallbackError, Schema, model } from "mongoose";
import argon2 from "argon2";

// TODO:[1] for all models, we also need to add validations that are the same in front-end, to enhance security, especially if APIs are allowed to modify items in backend

const userSchema = new Schema(
  {
    // Required
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(UserStatusEnum),
      required: true,
    },
    signupMethod: {
      type: String,
      enum: Object.values(UserSignupMethodEnum),
      required: true,
    },
    imageUrl: { type: String, required: true },
    imageName: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      required: true,
      default: RoleEnum.User,
    },

    // Optional
    shopName: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String },
    rating: { type: Number, default: 0, required: true },
    wishList: {
      type: [Schema.Types.ObjectId],
      required: true,
      default: [],
    },
    cart: {
      type: [
        {
          // productId: Schema.Types.ObjectId,
          // quantity: Number,
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true },
        },
      ],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.index(
  { email: 1 },
  { collation: { locale: "en", strength: 2 }, unique: true }
); // be case insensitive

userSchema.pre("save", async function (next) {
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
userSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v; // Optional: Remove __v (version key)
  },
});

const User = model("User", userSchema);
export default User;
