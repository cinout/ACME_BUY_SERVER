import { ApolloServer } from "@apollo/server";
import CategoryModel from "@/models/CategoryModel";

const typeCategory = `
  type Category {
    id: ID!
    name: String!
    image: String!
    slug: String!
  }

  type Query {
    getAllCategories: [Category!]!
  }
`;

const resolversCategory = {
  Query: {
    getAllCategories: async () => {
      const allCategories = await CategoryModel.find();

      return allCategories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        image: category.image,
        slug: category.slug,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }));
      // TODO: how to handle errors?
    },
  },
};

export const gqlServer = new ApolloServer({
  typeDefs: typeCategory,
  resolvers: resolversCategory,
  // TODO: how to get the results from authMiddleware?
});
