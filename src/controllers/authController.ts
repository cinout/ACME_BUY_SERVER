import { Request, Response } from "express";
import UserModel from "@/models/UserModel";
import { apiReponse, apiReponseGeneralError } from "@/utils/apiReponse";
import argon2 from "argon2";
import createToken, { cookieOptions } from "@/utils/createToken";
import { RoleEnum, UserStatusEnum } from "@/utils/enums";
import { randomDefaultImage } from "@/utils/imageSamples";

export default class authController {
  // User Signup
  static user_signup = async (req: Request, res: Response) => {
    const { firstname, lastname, email, password, signupMethod } = req.body;

    try {
      // check email existing
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return apiReponse(res, 409, { error: "Email already exists." });
      }

      const returnedUser = await UserModel.create({
        firstname,
        lastname,
        email,
        password,
        signupMethod,
        status: UserStatusEnum.Pending,
        imageName: "default_avatar.png",
        imageUrl: randomDefaultImage(), // TODO:[2] update the default image
        role: RoleEnum.User,
      });

      // TODO:[1] you might want to create user_customer schema. See video 190
      const accessToken = createToken({
        id: (returnedUser.toJSON() as unknown as { id: string }).id,
        email,
        role: RoleEnum.User,
      }); // the reason to include id and role is to ensure a unique token for each user
      res.cookie("accessToken", accessToken, cookieOptions);
      return apiReponse(res, 201, {
        message: "New user successfully created.",
        accessToken,
      }); // TODO: remove accessToken later, not recommended
    } catch (e) {
      return apiReponseGeneralError(res, e as Error);
    }
  };

  // User Login
  static user_login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const user = await UserModel.findOne({ email }).collation({
        locale: "en",
        strength: 2,
      });

      if (user) {
        if (await argon2.verify(user.password, password)) {
          // generate cookie
          const accessToken = createToken({
            id: user.id,
            email,
            role: user.role,
          });
          res.cookie("accessToken", accessToken, cookieOptions);
          return apiReponse(res, 200, {
            message: "Login success.",
            accessToken, // TODO: remove accessToken later, not recommended
          });
        } else {
          return apiReponse(res, 404, { error: "Password does not match." });
        }
      } else {
        return apiReponse(res, 404, { error: "Email not found." });
      }
    } catch (e) {
      return apiReponseGeneralError(res, e as Error);
    }
  };
}
