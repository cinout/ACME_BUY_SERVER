import ProductModel from "@/models/ProductModel";
import {
  checkAccessRight,
  checkIdMongooseValid,
  checkInputUpdateIsEmpty,
  checkRole,
  gql_custom_code_bad_user_input,
  gqlGenericError,
} from "@/utils/gqlErrorResponse";
import { GraphQLError } from "graphql";
import { uploadImages } from "@/utils/imageUpload";
import { RoleEnum } from "@/utils/enums";
import { FileUpload } from "graphql-upload/processRequest.mjs";

export const typeDefProduct = `
  scalar Upload
  scalar Date
  scalar ImageWithID

  type Product {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    name: String!
    artist: String!
    year: Int!
    format: String!
    grading: String!
    region: String!
    genreId: ID!
    userId: ID!
    stock: Int!
    price: Float!
    discount: Float!
    images: [ImageWithID!]!
    rating: Float!
    description: String
  }

  input UpdateProductInput {
    name: String
    artist: String
    year: Int
    format: String
    grading: String
    region: String
    images: [ImageWithID!]
    genreId: ID
    stock: Int
    price: Float
    discount: Float
    description: String
    rating: Float
  }

  extend type Query {
    getAllProductsByUser: [Product!]!
    getNewestProducts(count: Int!): [Product!]!
  }  

  extend type Mutation {
    createProduct(name: String!, artist: String!, year: Int!, format: String!, grading: String!, region: String!, images: [ImageWithID!]!, genreId: ID!, stock: Int!, price: Float!, discount: Float!, description: String): Product!

    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    
    deleteProduct(id: ID!): String
  }  
`;

export const resolversProduct = {
  Query: {
    getAllProductsByUser: async (
      _: unknown,
      args: void,
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        const products = await ProductModel.find({ userId: id });
        return products;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getNewestProducts: async (
      _: unknown,
      { count }: { count: number },
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        const products = await ProductModel.find()
          .sort("-createdAt")
          .limit(count);
        return products;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
  },
  Mutation: {
    createProduct: async (
      _: unknown,
      {
        name,
        images,
        price,
        discount,
        artist,
        year,
        format,
        grading,
        region,
        description,
        genreId,
        stock,
      }: {
        name: string;
        images: {
          id: string;
          file: string | { file: FileUpload };
          name: string;
        }[];
        price: number;
        discount: number;
        artist: string;
        description: string;
        genreId: string;
        stock: number;
        year: number;
        format: string;
        grading: string;
        region: string;
      },
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        const uploadResult = await uploadImages(images, "Products");

        const newProduct = await ProductModel.create({
          name,
          price,
          discount,
          artist,
          description,
          genreId,
          userId: id,
          stock,
          images: uploadResult,
          year,
          format,
          grading,
          region,
        });
        return newProduct;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    updateProduct: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          images: {
            id: string;
            file: string | { file: FileUpload };
            name: string;
          }[];
        };
      },
      { id: tokenId, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        checkIdMongooseValid(id);
        await checkAccessRight(tokenId, ProductModel, id, "userId");
        checkInputUpdateIsEmpty(input);

        if (input.images) {
          const uploadResult = await uploadImages(input.images, "Products");
          input.images = uploadResult;
        }

        const result = await ProductModel.findOneAndUpdate({ _id: id }, input, {
          runValidators: true,
          new: true,
        });

        if (!result) {
          throw new GraphQLError(`The product does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        } else {
          return result;
        }
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    deleteProduct: async (
      _: unknown,
      { id }: { id: string },
      { role }: { role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        checkIdMongooseValid(id);

        const result = await ProductModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
          throw new GraphQLError(`The product does not exist.`, {
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
