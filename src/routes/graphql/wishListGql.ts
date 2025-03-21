import { RoleEnum } from "@/utils/enums";
import {
  checkAccessRight,
  checkIdMongooseValid,
  checkRole,
  gql_custom_code_bad_user_input,
  gqlGenericError,
} from "@/utils/gqlErrorResponse";
import WishListModel from "@/models/WishListModel";
import { GraphQLError } from "graphql";

export const typeDefWishList = `
  type WishList {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    userId: ID!
    productId: ID!
  }
  
  extend type Mutation {
    addItemToWishListByUser(productId: ID!): WishList!
    removeWishListItemByUser(id: ID!): Boolean
  }
`;

export const resolversWishList = {
  Query: {
    //
  },

  Mutation: {
    addItemToWishListByUser: async (
      _: unknown,
      {
        productId,
      }: {
        productId: string;
      },
      { id: userId, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        checkIdMongooseValid(productId);
        checkIdMongooseValid(userId);
        const newWishListItem = await WishListModel.create({
          productId,
          userId,
        });
        return newWishListItem;
      } catch (error) {
        gqlGenericError(error as Error);
      }
    },
    removeWishListItemByUser: async (
      _: unknown,
      {
        id: wishListId,
      }: {
        id: string;
      },
      { id: userId, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        checkIdMongooseValid(userId);
        checkIdMongooseValid(wishListId);
        await checkAccessRight(userId, WishListModel, wishListId, "userId");

        const result = await WishListModel.deleteOne({ _id: wishListId });

        if (result.deletedCount === 0) {
          throw new GraphQLError(`The wish list item does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        } else {
          return true;
        }
      } catch (error) {
        gqlGenericError(error as Error);
      }
    },
  },
};
