import { RoleEnum, SellerStatusEnum } from "@/utils/enums";
import {
  checkInputUpdateIsEmpty,
  checkRole,
  gql_custom_code_bad_user_input,
  gqlGenericError,
} from "@/utils/gqlErrorResponse";
import SellerModel from "@/models/SellerModel";
import { GraphQLError } from "graphql";
import { uploadImage } from "@/utils/imageUpload";

export const typeDefSeller = `
  scalar Upload
  scalar Date

  enum SellerStatusEnum {
    Pending
    Deactivated
    Active
  }

  enum SellerSignupMethodEnum {
    Default
    Google
    Facebook
  }

  type Seller {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    firstname: String!
    lastname: String!
    email: String!
    password: String!
    status: SellerStatusEnum!
    signupMethod: SellerSignupMethodEnum!
    shopName: String!
    country: String
    state: String
    city: String
    zipCode: String
    imageUrl: String!
    imageName: String!
  }

  input UpdateSellerInput {
    firstname: String
    lastname: String
    password: String
    shopName: String
    country: String
    state: String
    city: String
    zipCode: String
    image: Upload
  }

  extend type Query {
    getCurrentSeller: Seller!
    getAllSellers: [Seller!]!
  }
  
  extend type Mutation {
    updateCurrentSeller(input: UpdateSellerInput!): Seller!
    updateSellerStatusByAdmin(id: ID!, status: SellerStatusEnum!): Seller!
  }
`;

export const resolversSeller = {
  Query: {
    getCurrentSeller: async (
      _,
      args,
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Seller]);
        const seller = await SellerModel.findById(id);
        if (seller) {
          return seller;
        } else {
          throw new GraphQLError(`The seller does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        }
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    getAllSellers: async (
      _,
      args,
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Admin]);
        const seller = await SellerModel.find();
        return seller;
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
  },
  Mutation: {
    updateCurrentSeller: async (
      _,
      { input }: { input: any },
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Seller]);
        checkInputUpdateIsEmpty(input);

        if (input.image) {
          const uploadResult = await uploadImage(input.image, "Seller");
          const { image, ...rest } = input;
          input = { ...rest, ...uploadResult };
        }

        const result = await SellerModel.findOneAndUpdate({ _id: id }, input, {
          runValidators: true,
          new: true,
        });

        if (!result) {
          throw new GraphQLError(`The seller does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        } else {
          return result;
        }
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
    updateSellerStatusByAdmin: async (
      _,
      { id: sellerId, status }: { id: string; status: SellerStatusEnum },
      { id: tokenId, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Admin]);

        const result = await SellerModel.findOneAndUpdate(
          { _id: sellerId },
          { status },
          {
            runValidators: true,
            new: true,
          }
        );

        if (!result) {
          throw new GraphQLError(`The seller does not exist.`, {
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
