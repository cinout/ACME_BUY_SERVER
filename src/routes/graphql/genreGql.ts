import GenreModel from "@/models/GenreModel";
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
import { FileUpload } from "graphql-upload/processRequest.mjs";

export const typeDefGenre = `
  scalar Upload
  scalar Date

  input UpdateGenreInput {
    name: String
    image: Upload
  }

  type Genre {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    name: String!
    imageUrl: String!
    imageName: String!
  }

  extend type Query {
    getAllGenres: [Genre!]!
  }  

  extend type Mutation {
    createGenre(name: String!, image: Upload!): Genre!
    updateGenre(id: ID!, input: UpdateGenreInput!): Genre!
    deleteGenre(id: ID!): String
  }  
`;

export const resolversGenre = {
  Query: {
    getAllGenres: async (_: unknown, __: void) => {
      try {
        const allGenres = await GenreModel.find();
        return allGenres;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
  },
  Mutation: {
    createGenre: async (
      _: unknown,
      {
        name,
        image,
      }: {
        name: string;
        image: { file: string | { file: FileUpload }; name: string };
      },
      { role }: { role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Admin]);

        const existingGenre = await GenreModel.findOne({ name });

        if (existingGenre) {
          throw new GraphQLError(`The genre name '${name}' already exists.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        }

        const uploadResult = await uploadImage(image, "Genre");

        const newGenre = await GenreModel.create({
          name,
          ...uploadResult,
        });

        return newGenre;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    updateGenre: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          name?: string;
          image?: { file: string | { file: FileUpload }; name: string };
        };
      },
      { role }: { role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Admin]);
        checkIdMongooseValid(id);
        checkInputUpdateIsEmpty(input);

        if (input.image) {
          const uploadResult = await uploadImage(input.image, "Genre");
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { image, ...rest } = input;
          input = { ...rest, ...uploadResult };
        }

        const result = await GenreModel.findOneAndUpdate({ _id: id }, input, {
          runValidators: true,
          new: true,
        });

        if (!result) {
          throw new GraphQLError(`The genre does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        } else {
          return result;
        }
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    deleteGenre: async (
      _: unknown,
      { id }: { id: string },
      { role }: { role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Admin]);
        checkIdMongooseValid(id);
        const result = await GenreModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
          throw new GraphQLError(`The genre does not exist.`, {
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
