import { ApolloServer } from "@apollo/server";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { resolversGenre, typeDefGenre } from "@/routes/graphql/genreGql";
import { resolversProduct, typeDefProduct } from "@/routes/graphql/productGql";
import { resolversUser, typeDefUser } from "@/routes/graphql/userGql";
// import { resolversAdmin, typeDefAdmin } from "@/routes/graphql/adminGql";
import { resolversAuth, typeDefAuth } from "./graphql/authGql";
import { resolverOrder, typeDefOrder } from "./graphql/orderGql";

const typeDefQuery = `
  scalar Upload
  scalar Date

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const gqlServer = new ApolloServer({
  typeDefs: [
    typeDefQuery,
    typeDefGenre,
    typeDefProduct,
    typeDefUser,
    typeDefAuth,
    typeDefOrder,
  ],
  resolvers: [
    resolversGenre,
    resolversProduct,
    resolversUser,
    resolversAuth,
    resolverOrder,
  ],
  csrfPrevention: true, // TODO:[1] still not recommended: https://www.apollographql.com/blog/file-upload-best-practices
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
