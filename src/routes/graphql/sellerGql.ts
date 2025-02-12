import { RoleEnum } from "@/utils/enums";
import {
  checkRole,
  gql_custom_code_bad_user_input,
  gqlGenericError,
} from "@/utils/gqlErrorResponse";
import SellerModel from "@/models/SellerModel";
import { GraphQLError } from "graphql";

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
    country: String
    state: String
    city: String
    zipCode: String
    imageUrl: String
    imageName: String
  }

  input UpdateSellerInput {
    firstname: String
    lastname: String
    email: String
    password: String
    status: SellerStatusEnum
    signupMethod: SellerSignupMethodEnum
    country: String
    state: String
    city: String
    zipCode: String
    imageUrl: String
    imageName: String
  }

  extend type Query {
    getCurrentSeller: Seller!
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
  },
};
