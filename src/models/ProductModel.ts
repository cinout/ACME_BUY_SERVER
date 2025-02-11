import { Schema, model } from "mongoose";

// TODO: how to add FK constraints?
const productSchema = new Schema(
  {
    // Required
    name: { type: String, required: true },
    brand: { type: String, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Seller",
    },
    stock: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0, required: true },
    images: {
      type: [
        {
          id: { type: String, required: true },
          file: { type: String, required: true },
          name: { type: String, required: true },
        },
      ],
      required: true,
    },
    rating: { type: Number, default: 0, required: true },
    // TODO: how to validate different Number types (Int, Float, ...)

    // Optional
    description: { type: String },
  },
  { timestamps: true }
);

// Transform _id to id
productSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v; // Optional: Remove __v (version key)
  },
});

const Product = model("Product", productSchema);
export default Product;
