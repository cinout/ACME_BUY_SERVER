import { RoleEnum } from "@/utils/enums";
import {
  checkRole,
  gql_custom_code_bad_user_input,
  gqlGenericError,
} from "@/utils/gqlErrorResponse";
import AdminModel from "@/models/AdminModel";
import { GraphQLError } from "graphql";

export const typeDefAdmin = `
  scalar Upload
  scalar Date

  type Admin {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    firstname: String!
    lastname: String!
    email: String!
    password: String!
    imageUrl: String!
    imageName: String!
  }

  input UpdateAdminInput {
    firstname: String
    lastname: String
    email: String
    password: String
    imageUrl: String
    imageName: String
  }

  extend type Query {
    getCurrentAdmin: Admin!
  }  

  
`;

export const resolversAdmin = {
  Query: {
    getCurrentAdmin: async (
      _,
      args,
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.Admin]);
        const admin = await AdminModel.findById(id);
        if (admin) {
          return admin;
        } else {
          throw new GraphQLError(`The admin does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        }
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
  },
};
