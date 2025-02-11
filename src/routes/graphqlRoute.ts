import { ApolloServer } from "@apollo/server";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import {
  resolversCategory,
  typeDefCategory,
} from "@/routes/graphql/categoryGql";
import { resolversProduct, typeDefProduct } from "@/routes/graphql/productGql";

const typeDefQuery = `
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const gqlServer = new ApolloServer({
  typeDefs: [typeDefQuery, typeDefCategory, typeDefProduct],
  resolvers: [resolversCategory, resolversProduct],
  csrfPrevention: true, // TODO: still not recommended: https://www.apollographql.com/blog/file-upload-best-practices
  cache: "bounded", // TODO: what does this mean?
  formatError: (error) => {
    console.log(error);
    const isGenericError =
      error.extensions?.code === ApolloServerErrorCode.INTERNAL_SERVER_ERROR; // if it is Generic Error, don't send details to client

    return {
      message: isGenericError ? "Internal server error" : error.message,
      code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
      httpStatus: error.extensions?.httpStatus,
      details: error.extensions?.stacktrace,
    };
  },
});
