import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    // Required
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageName: { type: String, required: true },
  },
  { timestamps: true }
);

categorySchema.index(
  { name: 1 },
  { collation: { locale: "en", strength: 2 }, unique: true }
); // be case insensitive

// Transform _id to id
categorySchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v; // Optional: Remove __v (version key)
  },
});

const Category = model("Category", categorySchema);
export default Category;
