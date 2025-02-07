import CategoryModel from "@/models/CategoryModel";
import {
  checkEmptyFields,
  checkIdMongooseValid,
  gql_custom_code_bad_user_input,
  gqlGenericError,
} from "@/utils/gqlErrorResponse";
import { generateImageSlug } from "@/utils/strings";
import { GraphQLError } from "graphql";
import cloudinary from "@/utils/cloudConfig";
import { UploadApiResponse, UploadStream } from "cloudinary";
import { image_url_1 } from "@/utils/removeLater";
import { FileUpload } from "graphql-upload/processRequest.mjs";
import { uploadImage } from "@/utils/imageUpload";

export const typeDefCategory = `
  scalar Upload

  type Category {
    id: ID!
    name: String!
    imageUrl: String!
    imageType: String!
    slug: String!
  }

  extend type Query {
    getAllCategories: [Category!]!
  }  

  extend type Mutation {
    createCategory(name: String!, image: Upload!): Category!
    updateCategory(id: ID!, name: String!, image: Upload!): Category!
    deleteCategory(id: ID!): String
  }  
`;

export const resolversCategory = {
  Query: {
    getAllCategories: async () => {
      try {
        const allCategories = await CategoryModel.find();
        return allCategories;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
  },
  Mutation: {
    createCategory: async (
      _,
      { name, image }: { name: string; image: any }
    ) => {
      try {
        checkEmptyFields({ name, image });

        const existingCategory = await CategoryModel.findOne({ name });

        if (existingCategory) {
          throw new GraphQLError(
            `The category name '${name}' already exists.`,
            {
              extensions: gql_custom_code_bad_user_input,
            }
          );
        }

        const slug = generateImageSlug(name); // TODO: is it ideal

        const { uploadResult, mimetype } = await uploadImage(image, "Category");

        const newCategory = await CategoryModel.create({
          name,
          imageUrl: image_url_1,
          // TODO: imageUrl: (uploadResult as UploadApiResponse).url,
          imageType: mimetype,
          slug,
        });

        return newCategory;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    updateCategory: async (
      _,
      { id, name, image }: { id: string; name: string; image: any }
    ) => {
      try {
        checkEmptyFields({ id, name, image });
        checkIdMongooseValid(id);

        const slug = generateImageSlug(name); // TODO: is it ideal?
        let updateFields = {};
        if (typeof image === "string") {
          // the image is not updated
          updateFields = {
            imageUrl: image,
            name,
            slug,
          };
        } else {
          // image is updated

          const { uploadResult, mimetype } = await uploadImage(
            image,
            "Category"
          );

          updateFields = {
            imageUrl: image_url_1,
            // TODO: imageUrl: (uploadResult as UploadApiResponse).url,
            name,
            imageType: mimetype,
            slug,
          };
        }

        const result = await CategoryModel.findOneAndUpdate(
          { _id: id },
          updateFields,
          { runValidators: true, new: true }
        );

        if (!result) {
          throw new GraphQLError(`The category does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        } else {
          return result;
        }
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    deleteCategory: async (_, { id }: { id: string }) => {
      try {
        checkEmptyFields({ id });
        checkIdMongooseValid(id);
        const result = await CategoryModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
          throw new GraphQLError(`The category does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        } else {
          return id;
        }
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
  },
};
