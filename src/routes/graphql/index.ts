import { ApolloServer } from "@apollo/server";
import CategoryModel from "@/models/CategoryModel";
import { generateImageSlug } from "@/utils/strings";
import cloudinary from "@/utils/cloudConfig";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { UploadApiResponse, UploadStream } from "cloudinary";
import { GraphQLError } from "graphql";
import {
  gql_custom_code_bad_user_input,
  gqlGenericError,
} from "@/utils/gqlErrorResponse";
// TODO: why declare scalar Upload? WHat's the meaning of scalar and Upload?
const typeCategory = `
  scalar Upload

  type Category {
    id: ID!
    name: String!
    imageUrl: String!
    imageType: String!
    slug: String!
  }

  type Query {
    getAllCategories: [Category!]!
  }

  type Mutation {
    createCategory(name: String!, image: Upload!): Category!
  }
`;

const resolversCategory = {
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
    createCategory: async (_, data: { name: string; image: any }) => {
      try {
        const { name, image } = data;

        const existingCategory = await CategoryModel.findOne({ name });
        if (existingCategory) {
          throw new GraphQLError(
            `The category name '${name}' already exists.`,
            {
              extensions: gql_custom_code_bad_user_input,
            }
          );
        }

        const slug = generateImageSlug(name); // TODO: is it ideal?

        const { createReadStream, mimetype, filename } = image.file;
        const stream = createReadStream();

        // TODO: remove comment
        // const uploadResult = await new Promise((resolve, reject) => {
        //   const uploadStream = cloudinary.uploader.upload_stream(
        //     { folder: "Categories" }, // Optional: specify a folder in your Cloudinary account
        //     (error, result) => {
        //       if (result) {
        //         resolve(result);
        //       } else {
        //         reject(error);
        //       }
        //     }
        //   );
        //   stream.pipe(uploadStream);
        // });

        const newCategory = await CategoryModel.create({
          name,
          imageUrl:
            "http://res.cloudinary.com/dcavpobmc/image/upload/v1738491538/Categories/yvxwwkjos4hurben2dhk.png",
          // TODO: imageUrl: (uploadResult as UploadApiResponse).url,
          imageType: mimetype,
          slug,
        });

        return newCategory;
      } catch (e) {
        // TODO: you can check the error type and returnn more specific errors
        gqlGenericError(e as Error);
      }
    },
  },
};

export const gqlServer = new ApolloServer({
  typeDefs: typeCategory,
  resolvers: resolversCategory,
  csrfPrevention: true, // TODO: still not recommended: https://www.apollographql.com/blog/file-upload-best-practices
  cache: "bounded", // TODO: what does this mean?
  formatError: (error) => {
    const isGenericError =
      error.extensions?.code === ApolloServerErrorCode.INTERNAL_SERVER_ERROR; // if it is Generic Error, don't send details to client

    return {
      message: isGenericError ? "Internal server error" : error.message,
      code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
      httpStatus: error.extensions?.httpStatus,
      details: error.extensions?.stacktrace,
    };
  },

  // TODO: how to get the results from authMiddleware?
});
