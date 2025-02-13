import { GraphQLError } from "graphql";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import mongoose, { Model } from "mongoose";
import { RoleEnum } from "./enums";

/**
 * Wrapper for error
 */
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

/**
 * Custom Error
 */
// bad user input
export const gql_custom_code_bad_user_input = {
  code: ApolloServerErrorCode.BAD_USER_INPUT,
  httpStatus: 400,
};
// forbidden
export const gql_custom_code_forbidden = {
  code: "Forbidden Resource",
  httpStatus: 403,
};

/**
 * Checker Functions
 */
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

// Check if role is correct
export function checkRole(userRole: RoleEnum, requiredRoles: RoleEnum[]) {
  if (!requiredRoles.includes(userRole)) {
    throw new GraphQLError(`The user has no access to the resource.`, {
      extensions: gql_custom_code_forbidden,
    });
  }
}

// Check if the input (in update resolver) is empty
export function checkInputUpdateIsEmpty(input: Record<string, unknown>) {
  if (Object.keys(input).length === 0) {
    throw new GraphQLError(`No field is updated.`, {
      extensions: gql_custom_code_bad_user_input,
    });
  }
}

// Check if the user's tokenId fits the item's access Id
export async function checkAccessRight<T>(
  tokenId: string,
  model: Model<T>,
  id: string,
  field: string
) {
  const fieldValue = (await model.findById(id).select(field)) as {
    [key: string]: mongoose.Types.ObjectId;
  };
  if (fieldValue) {
    const requiredId = fieldValue[field].toString();
    if (requiredId !== tokenId) {
      throw new GraphQLError(`The user has no access to the resource.`, {
        extensions: gql_custom_code_forbidden,
      });
    }
  } else {
    throw new GraphQLError(`The item does not exist.`, {
      extensions: gql_custom_code_bad_user_input,
    });
  }
}
