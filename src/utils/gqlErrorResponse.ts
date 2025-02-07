import { GraphQLError } from "graphql";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import mongoose from "mongoose";

// Wrapper for error
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

// Custom Error: bad user input
export const gql_custom_code_bad_user_input = {
  code: ApolloServerErrorCode.BAD_USER_INPUT,
  httpStatus: 400,
};

// Check if id is a valid Mongoose ID
export function checkIdMongooseValid(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new GraphQLError(`The category is invalid.`, {
      extensions: gql_custom_code_bad_user_input,
    });
  }
}

// Check if fields are empty
export function checkEmptyFields(fieldArray: object) {
  Object.entries(fieldArray).forEach(([key, value]) => {
    if (!value) {
      throw new GraphQLError(`The field ${key} is not provided.`, {
        extensions: gql_custom_code_bad_user_input,
      });
    }
  });
}
