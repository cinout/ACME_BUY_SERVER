import { RoleEnum, UserStatusEnum } from "@/utils/enums";
import {
  checkIdMongooseValid,
  checkInputUpdateIsEmpty,
  checkRole,
  gql_custom_code_bad_user_input,
  gqlGenericError,
} from "@/utils/gqlErrorResponse";
import UserModel from "@/models/UserModel";
import WishListModel from "@/models/WishListModel";
import { GraphQLError } from "graphql";
import { uploadImage } from "@/utils/imageUpload";
import { FileUpload } from "graphql-upload/processRequest.mjs";
import { GqlRouteContext } from "..";

export const typeDefUser = `
  scalar CartWithQuantity
  enum UserStatusEnum {
    Pending
    Deactivated
    Active
  }

  enum UserSignupMethodEnum {
    Default
    Google
    Facebook
  }

  enum RoleEnum {
    User
    Admin
  }

  type User {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    firstname: String!
    lastname: String!
    email: String!
    password: String!
    status: UserStatusEnum!
    signupMethod: UserSignupMethodEnum!
    role: RoleEnum!
    shopName: String
    country: String
    state: String
    city: String
    zipCode: String
    imageUrl: String!
    imageName: String!
    rating: Float!
    wishList: [WishList!]
    wishListDetails: [Product!]!
    cart: [CartWithQuantity!]!
    cartDetails: [Product!]
  }

  input UpdateUserInput {
    firstname: String
    lastname: String
    password: String
    shopName: String
    country: String
    state: String
    city: String
    zipCode: String
    image: Upload
    rating: Float
    cart: [CartWithQuantity!]
  }

  extend type Query {
    getCurrentUser: User!
    getCurrentUserCartDetails: User!
    getAllUsers: [User!]!
    getCurrentUserWishListDetails: User!
    getUserById(id: ID!): User!
  }
  
  extend type Mutation {
    updateCurrentUser(input: UpdateUserInput!): User!
    updateUserStatusByAdmin(id: ID!, status: UserStatusEnum!): User!
  }
`;

export const resolversUser = {
  Query: {
    getCurrentUser: async (
      _: unknown,
      __: void,
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User, RoleEnum.Admin]);
        checkIdMongooseValid(id);
        const user = await UserModel.findById(id);
        if (user) {
          return user;
        } else {
          throw new GraphQLError(`The user does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        }
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getCurrentUserCartDetails: async (
      _: unknown,
      __: void,
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User, RoleEnum.Admin]);
        checkIdMongooseValid(id);
        const user = await UserModel.findById(id);
        if (user) {
          return user;
        } else {
          throw new GraphQLError(`The user does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        }
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getCurrentUserWishListDetails: async (
      _: unknown,
      __: void,
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        checkIdMongooseValid(id);

        const user = await UserModel.findById(id);
        if (user) {
          return user;
        } else {
          throw new GraphQLError(`The user does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        }
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getAllUsers: async (_: unknown, __: void, { role }: { role: RoleEnum }) => {
      try {
        checkRole(role, [RoleEnum.Admin]); // TODO:[1] see if you need to update
        const users = await UserModel.find({ role: RoleEnum.User });
        return users;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getUserById: async (_: unknown, { id }: { id: string }) => {
      try {
        checkIdMongooseValid(id);
        const user = await UserModel.findById(id);
        if (!user) {
          throw new GraphQLError(`The user does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        }
        return user;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
  },
  User: {
    cartDetails: async (
      parent: { cart: { productId: string; quantity: number }[] },
      _: void,
      { loaders }: GqlRouteContext
    ) => {
      return await Promise.all(
        // queues all load() calls without waiting.
        // DataLoader batches them together in the same event loop cycle
        parent.cart.map((cartItem) =>
          loaders.productDataLoader.load(cartItem.productId)
        )
      );
    },
    wishList: async (parent: { id: string }, _: void) => {
      checkIdMongooseValid(parent.id);
      const wishListItems = await WishListModel.find({ userId: parent.id });
      return wishListItems;
    },
    wishListDetails: async (
      parent: { id: string },
      _: void,
      { loaders }: GqlRouteContext
    ) => {
      checkIdMongooseValid(parent.id);
      const wishListItems = await WishListModel.find({
        userId: parent.id,
      }).select(["productId"]);

      return await Promise.all(
        wishListItems.map((item) =>
          loaders.productDataLoader.load(item.productId as unknown as string)
        )
      );
    },
  },
  Mutation: {
    updateCurrentUser: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          image?: { file: string | { file: FileUpload }; name: string };
          name?: string;
        };
      },
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        checkIdMongooseValid(id);
        checkInputUpdateIsEmpty(input);

        if (input.image) {
          const uploadResult = await uploadImage(input.image, "User");
          const { image, ...rest } = input;
          input = { ...rest, ...uploadResult };
        }

        const result = await UserModel.findOneAndUpdate({ _id: id }, input, {
          runValidators: true,
          new: true,
        });

        if (!result) {
          throw new GraphQLError(`The user does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        } else {
          return result;
        }
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    updateUserStatusByAdmin: async (
      _: unknown,
      { id: userId, status }: { id: string; status: UserStatusEnum },
      { role }: { role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Admin]);
        checkIdMongooseValid(userId);

        const result = await UserModel.findOneAndUpdate(
          { _id: userId },
          { status },
          {
            runValidators: true,
            new: true,
          }
        );

        if (!result) {
          throw new GraphQLError(`The user does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        } else {
          return result;
        }
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
  },
};
