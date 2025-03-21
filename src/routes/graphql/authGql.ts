import { nodeEnv } from "@/utils/config";
import { RoleEnum } from "@/utils/enums";
import { checkRole, gqlGenericError } from "@/utils/gqlErrorResponse";

import { Response } from "express";

export const typeDefAuth = `
  extend type Mutation {
    logout: String!
  }
`;

export const resolversAuth = {
  // Query: {},
  Mutation: {
    logout: async (
      _: unknown,
      __: void,
      { res, role }: { role: RoleEnum; res: Response }
    ) => {
      try {
        checkRole(role, [RoleEnum.Admin, RoleEnum.User]);
        res.clearCookie("accessToken", {
          httpOnly: true,
          secure: nodeEnv === "production",
          sameSite: "strict" as const,
        });
        return "Log out successfully";
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
  },
};
