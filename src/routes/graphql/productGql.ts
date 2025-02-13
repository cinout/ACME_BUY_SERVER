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
    brand: String!
    categoryId: ID!
    sellerId: ID!
    stock: Int!
    price: Float!
    discount: Float!
    images: [ImageWithID!]!
    rating: Float!
    description: String
  }

  input UpdateProductInput {
    name: String
    brand: String
    images: [ImageWithID!]
    categoryId: ID
    stock: Int
    price: Float
    discount: Float
    description: String
    rating: Float
  }

  extend type Query {
    getAllProductsBySeller: [Product!]!
  }  

  extend type Mutation {
    createProduct(name: String!, brand: String!, images: [ImageWithID!]!, categoryId: ID!, stock: Int!, price: Float!, discount: Float!, description: String): Product!

    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    
    deleteProduct(id: ID!): String
  }  
`;

export const resolversProduct = {
  Query: {
    getAllProductsBySeller: async (
      _: unknown,
      args: void,
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Seller]);
        const products = await ProductModel.find({ sellerId: id });
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
        brand,
        description,
        categoryId,
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
        brand: string;
        description: string;
        categoryId: string;
        stock: number;
      },
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Seller]);
        const uploadResult = await uploadImages(images, "Products");

        const newProduct = await ProductModel.create({
          name,
          price,
          discount,
          brand,
          description,
          categoryId,
          sellerId: id,
          stock,
          images: uploadResult,
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
        // name: string;
        // images: { id: string; file: any; name: string }[];
        // price: number;
        // discount: number;
        // brand: string;
        // description: string;
        // categoryId: string;
        // stock: number;
      },
      { id: tokenId, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Seller]);
        checkIdMongooseValid(id);
        await checkAccessRight(tokenId, ProductModel, id, "sellerId");
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
        checkRole(role, [RoleEnum.Seller]);
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
