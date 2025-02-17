import { GradingEnum, MediaFormatEnum, ReleaseRegionEnum } from "@/utils/enums";
import { Schema, model } from "mongoose";

// TODO: how to add FK constraints?
const productSchema = new Schema(
  {
    // Required
    name: { type: String, required: true },
    artist: { type: String, required: true },
    year: { type: Number, required: true },

    format: {
      type: String,
      enum: Object.values(MediaFormatEnum),
      required: true,
    },
    grading: {
      type: String,
      enum: Object.values(GradingEnum),
      required: true,
    },
    region: {
      type: String,
      enum: Object.values(ReleaseRegionEnum),
      required: true,
    },

    genreId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Genre",
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
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
