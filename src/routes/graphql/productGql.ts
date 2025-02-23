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
import { GradingEnum, MediaFormatEnum, RoleEnum } from "@/utils/enums";
import { FileUpload } from "graphql-upload/processRequest.mjs";
import mongoose from "mongoose";
import { resolversGenre } from "./genreGql";

export const typeDefProduct = `
  scalar ImageWithID
  scalar TrackList

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
    genreIds: [ID!]!
    genres: [Genre!]!
    userId: ID!
    user: User
    stock: Int!
    price: Float!
    discount: Float!
    images: [ImageWithID!]!
    tracklist: [TrackList!]
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
    genreIds: [ID!]
    tracklist: [TrackList!]
    stock: Int
    price: Float
    discount: Float
    description: String
  }

  extend type Query {
    getAllProductsByUser: [Product!]!
    getNewestProducts(count: Int!): [Product!]!
    getNewVinyls(count: Int!): [Product!]!
    getNewCassettes(count: Int!): [Product!]!
    getNewCDs(count: Int!): [Product!]!
    getNewReleases(count: Int!): [Product!]!
    getOldReleases(count: Int!): [Product!]!
    getDiscounted(count: Int!): [Product!]!
    getMint(count: Int!): [Product!]!
    getSimilar(count: Int!): [Product!]!
    getProductById(id: ID!): Product!
  }  

  extend type Mutation {
    createProduct(name: String!, artist: String!, year: Int!, format: String!, grading: String!, region: String!, images: [ImageWithID!]!, genreIds: [ID!], tracklist: [TrackList!], stock: Int!, price: Float!, discount: Float!, description: String): Product!

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

    getNewVinyls: async (_: unknown, { count }: { count: number }) => {
      try {
        const products = await ProductModel.find({
          format: {
            $in: [
              MediaFormatEnum.Vinyl_7,
              MediaFormatEnum.Vinyl_10,
              MediaFormatEnum.Vinyl_12,
            ],
          },
        })
          .sort("-createdAt")
          .limit(count);

        return products;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getNewCDs: async (_: unknown, { count }: { count: number }) => {
      try {
        const products = await ProductModel.find({
          format: MediaFormatEnum.CD,
        })
          .sort("-createdAt")
          .limit(count);

        return products;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getNewCassettes: async (_: unknown, { count }: { count: number }) => {
      try {
        const products = await ProductModel.find({
          format: MediaFormatEnum.Cassette,
        })
          .sort("-createdAt")
          .limit(count);

        return products;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getNewReleases: async (_: unknown, { count }: { count: number }) => {
      try {
        const endYear = new Date().getFullYear();
        let products = await ProductModel.aggregate([
          { $match: { year: endYear } }, // filter the results
          { $sample: { size: count } },
        ]);
        if (products.length < count) {
          const appendResults = await ProductModel.aggregate([
            { $match: { year: endYear - 1 } }, // filter the results
            { $sample: { size: count - products.length } },
          ]);
          products = [...products, ...appendResults];
        }
        return products.map((a) => ({ ...a, id: a._id.toString() }));
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getOldReleases: async (_: unknown, { count }: { count: number }) => {
      try {
        const products = await ProductModel.aggregate([
          { $match: { year: { $lte: 1980 } } }, // filter the results
          { $sample: { size: count } },
        ]);
        return products.map((a) => ({ ...a, id: a._id.toString() }));
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getDiscounted: async (_: unknown, { count }: { count: number }) => {
      try {
        const products = await ProductModel.aggregate([
          { $match: { discount: { $lte: 30 } } }, // filter the results
          { $sample: { size: count } },
        ]);
        return products.map((a) => ({ ...a, id: a._id.toString() }));
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getMint: async (_: unknown, { count }: { count: number }) => {
      try {
        // TODO:[1] need to include product, and find similar genres, artist etc...
        const products = await ProductModel.aggregate([
          { $match: { grading: GradingEnum.Mint } }, // filter the results
          { $sample: { size: count } },
        ]);
        return products.map((a) => ({ ...a, id: a._id.toString() }));
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getSimilar: async (_: unknown, { count }: { count: number }) => {
      try {
        const products = await ProductModel.aggregate([
          { $sample: { size: count } },
        ]);
        return products.map((a) => ({ ...a, id: a._id.toString() }));
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getProductById: async (_: unknown, { id }: { id: string }) => {
      try {
        // const product = await ProductModel.findById(id);
        const product = await ProductModel.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(id) } }, // Find the product
          {
            $lookup: {
              from: "users", // Collection to join
              localField: "userId", // FK in products
              foreignField: "_id", // PK in shops
              as: "user",
            },
          },
          {
            $lookup: {
              from: "genres", // Collection to join
              localField: "genreIds", // FK in products
              foreignField: "_id", // PK in genres
              as: "genres",
            },
          },
          {
            $unwind: "$user", // Convert shop array into an object (assuming one shop per product)
          },
          // {
          //   $unwind: "$genre", // Convert genre array into an object (assuming one genre per product)
          // },
        ]);

        if (product.length === 0) {
          throw new GraphQLError(`The product does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        }

        const mappedProduct = product.map((a) => ({
          ...a,
          id: a._id.toString(),
          genres: a.genres.map((a: { _id: { toString: () => string } }) => ({
            ...a,
            id: a._id.toString(),
          })),
          user: {
            ...a.user,
            id: a.user._id.toString(),
          },
        }));

        return mappedProduct[0];
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
  },
  // TODO: Field resolvers
  // Item: {},
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
        genreIds,
        tracklist,
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
        genreIds: string[];
        tracklist: { title: string; indexDisplay: string }[];
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
          genreIds,
          tracklist,
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
