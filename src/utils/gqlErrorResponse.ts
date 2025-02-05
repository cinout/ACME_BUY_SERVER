import { GraphQLError } from "graphql";
import { ApolloServerErrorCode } from "@apollo/server/errors";

export function gqlGenericError(error: Error) {
  if (error instanceof GraphQLError) {
    // Re-throw the original GraphQLError to preserve its extensions
    throw error;
  } else {
    // throw a new GraphQLError with default extensions
    throw new GraphQLError(error.message, {
      extensions: {
        code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
        httpStatus: 500,
      },
    });
  }
}

export const gql_custom_code_bad_user_input = {
  code: "BAD_USER_INPUT",
  httpStatus: 400,
};
