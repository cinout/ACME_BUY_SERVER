import CategoryModel from "@/models/CategoryModel";
import {
  checkIdMongooseValid,
  checkInputUpdateIsEmpty,
  checkRole,
  gql_custom_code_bad_user_input,
  gqlGenericError,
} from "@/utils/gqlErrorResponse";
import { GraphQLError } from "graphql";
import { uploadImage } from "@/utils/imageUpload";
import { RoleEnum } from "@/utils/enums";

export const typeDefCategory = `
  scalar Upload
  scalar Date

  input UpdateCategoryInput {
    name: String
    image: Upload
  }

  type Category {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    name: String!
    imageUrl: String!
    imageName: String!
  }

  extend type Query {
    getAllCategories: [Category!]!
  }  

  extend type Mutation {
    createCategory(name: String!, image: Upload!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
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
      { name, image }: { name: string; image: { file: any; name: string } },
      { role }: { role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Admin]);

        const existingCategory = await CategoryModel.findOne({ name });

        if (existingCategory) {
          throw new GraphQLError(
            `The category name '${name}' already exists.`,
            {
              extensions: gql_custom_code_bad_user_input,
            }
          );
        }

        const uploadResult = await uploadImage(image, "Category");

        const newCategory = await CategoryModel.create({
          name,
          ...uploadResult,
        });

        return newCategory;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    updateCategory: async (
      _,
      {
        id,
        input,
      }: {
        id: string;
        input: { name?: string; image?: { file: any; name: string } };
      },
      { role }: { role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Admin]);
        checkIdMongooseValid(id);
        checkInputUpdateIsEmpty(input);

        if (input.image) {
          const uploadResult = await uploadImage(input.image, "Category");
          const { image, ...rest } = input;
          input = { ...rest, ...uploadResult };
        }

        const result = await CategoryModel.findOneAndUpdate(
          { _id: id },
          input,
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
    deleteCategory: async (
      _,
      { id }: { id: string },
      { role }: { role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Admin]);
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
