import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    // Required
    name: { type: String, required: true, index: true, unique: true },
    image: { type: String, required: true }, // TODO: move all images to a new schema
    slug: { type: String, required: true }, // TODO: what is this for?
  },
  { timestamps: true }
);

const Category = model("Category", categorySchema);
export default Category;
