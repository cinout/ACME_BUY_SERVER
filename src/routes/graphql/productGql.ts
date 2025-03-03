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
import {
  GradingEnum,
  MediaFormatEnum,
  ReleaseYearRangeEnum,
  RoleEnum,
} from "@/utils/enums";
import { FileUpload } from "graphql-upload/processRequest.mjs";
import mongoose, { ObjectId } from "mongoose";
import { getYearRangeForMongoDB } from "@/utils/date";
import { GqlRouteContext } from "..";

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

  type ProductPagination {
    products: [Product!]!
    count: Int!
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

  input FilterOptions {
    genre: String
    format: String
    year: String
    grading: String
    region: String
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
    getLowPrice(count: Int!): [Product!]!
    getMint(count: Int!): [Product!]!
    getSimilar(count: Int!): [Product!]!
    getProductAndRelatedDetailsById(id: ID!): Product!
    getProductByUserId(id: ID!): [Product!]!
    getCollection(take: Int!, skip: Int!, sorting: String, filters: FilterOptions): ProductPagination
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
    getLowPrice: async (_: unknown, { count }: { count: number }) => {
      try {
        const products = await ProductModel.aggregate([
          {
            $addFields: {
              discountedPrice: {
                $divide: [
                  { $multiply: ["$price", { $subtract: [100, "$discount"] }] },
                  100,
                ],
              }, // Compute product
            },
          },
          { $sort: { discountedPrice: 1 } }, // filter the results
          { $limit: count },
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

    getProductByUserId: async (_: unknown, { id }: { id: string }) => {
      try {
        const products = await ProductModel.find({ userId: id });
        return products;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getCollection: async (
      _: unknown,
      {
        take,
        skip,
        sorting,
        filters,
      }: {
        take: number;
        skip: number;
        sorting?: string;
        filters: {
          genre?: string;
          format?: string;
          year?: ReleaseYearRangeEnum;
          grading?: string;
          region?: string;
        };
      }
    ) => {
      try {
        // handle filters
        const query: {
          genreIds?: { $in: mongoose.Types.ObjectId[] };
          format?: string;
          year?: { $lt: number; $gte?: number | undefined };
          grading?: string;
          region?: string;
        } = {};
        if (filters.format) {
          query.format = filters.format;
        }
        if (filters.grading) {
          query.grading = filters.grading;
        }
        if (filters.region) {
          query.region = filters.region;
        }
        if (filters.year) {
          query.year = getYearRangeForMongoDB(filters.year);
        }
        if (filters.genre) {
          query.genreIds = {
            $in: [new mongoose.Types.ObjectId(filters.genre)],
          };
        }

        // handle sorting
        let sortValue = null;
        switch (sorting) {
          case "added-desc": {
            sortValue = { createdAt: -1 };
            // sortValue = "-createdAt";
            break;
          }
          case "added-asc": {
            sortValue = { createdAt: 1 };
            // sortValue = "createdAt";
            break;
          }
          case "year-desc": {
            sortValue = { year: -1 };
            // sortValue = "-year";
            break;
          }
          case "year-asc": {
            sortValue = { year: 1 };
            // sortValue = "year";
            break;
          }
          // TODO:[3] price should be price X discount
          case "price-desc": {
            sortValue = { discountedPrice: -1 };
            // sortValue = "-price";
            break;
          }
          case "price-asc": {
            sortValue = { discountedPrice: 1 };
            // sortValue = "price";
            break;
          }
          case "name-desc": {
            sortValue = { name: -1 };
            // sortValue = "-name";
            break;
          }
          case "name-asc": {
            sortValue = { name: 1 };
            // sortValue = "name";
            break;
          }
        }
        const count = await ProductModel.countDocuments(query);

        // const products = await ProductModel.find(query)
        //   .sort(sortValue)
        //   .skip(skip)
        //   .limit(take);

        const products = await ProductModel.aggregate([
          {
            $addFields: {
              discountedPrice: {
                $divide: [
                  { $multiply: ["$price", { $subtract: [100, "$discount"] }] },
                  100,
                ],
              }, // Compute product
            },
          },
          { $match: query },
          ...(sortValue ? [{ $sort: sortValue }] : []),
          { $skip: skip },
          { $limit: take },
        ]);

        const mappedProduct = products.map((a) => ({
          ...a,
          id: a._id.toString(),
          // genres: a.genres.map((a: { _id: { toString: () => string } }) => ({
          //   ...a,
          //   id: a._id.toString(),
          // })),
          // user: {
          //   ...a.user,
          //   id: a.user._id.toString(),
          // },
        }));

        return { products: mappedProduct, count };
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getProductAndRelatedDetailsById: async (
      _: unknown,
      { id }: { id: string }
    ) => {
      try {
        const product = await ProductModel.findById(id);
        if (!product) {
          if (!product) {
            throw new GraphQLError(`The product does not exist.`, {
              extensions: gql_custom_code_bad_user_input,
            });
          }
        }
        return product;
        // const product = await ProductModel.aggregate([
        //   { $match: { _id: new mongoose.Types.ObjectId(id) } }, // Find the product
        //   // {
        //   //   $lookup: {
        //   //     from: "users", // Collection to join
        //   //     localField: "userId", // FK in products
        //   //     foreignField: "_id", // PK in shops
        //   //     as: "user",
        //   //   },
        //   // },
        //   {
        //     $lookup: {
        //       from: "genres", // Collection to join
        //       localField: "genreIds", // FK in products
        //       foreignField: "_id", // PK in genres
        //       as: "genres",
        //     },
        //   },
        //   // {
        //   //   $unwind: "$user", // Convert shop array into an object (assuming one shop per product)
        //   // },
        // ]);

        // if (product.length === 0) {
        //   throw new GraphQLError(`The product does not exist.`, {
        //     extensions: gql_custom_code_bad_user_input,
        //   });
        // }

        // const mappedProduct = product.map((a) => ({
        //   ...a,
        //   id: a._id.toString(),
        //   genres: a.genres.map((a: { _id: { toString: () => string } }) => ({
        //     ...a,
        //     id: a._id.toString(),
        //   })),
        //   // user: {
        //   //   ...a.user,
        //   //   id: a.user._id.toString(),
        //   // },
        // }));

        // return mappedProduct[0];
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
  },
  Product: {
    user: async (
      parent: { userId: string },
      _: void,
      { loaders }: GqlRouteContext
    ) => {
      const user = await loaders.userDataLoader.load(parent.userId);
      return user;
    },
    genres: async (
      parent: { genreIds: string[] },
      _: void,
      { loaders }: GqlRouteContext
    ) => {
      // Promise.all([...]) waits for all promises to resolve in parallel.
      return await Promise.all(
        // queues all load() calls without waiting.
        // DataLoader batches them together in the same event loop cycle
        parent.genreIds.map((genreId) => loaders.genreDataLoader.load(genreId))
      );
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
