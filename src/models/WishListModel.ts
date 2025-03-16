import { Schema, model } from "mongoose";

// TODO:[1] for all models, we also need to add validations that are the same in front-end, to enhance security, especially if APIs are allowed to modify items in backend

const wishListSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    productId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

// add index because  queries often filter by userId or productId
wishListSchema.index({ userId: 1, productId: 1 });

// Transform _id to id
wishListSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v; // Optional: Remove __v (version key)
  },
});

const WishList = model("WishList", wishListSchema);
export default WishList;
