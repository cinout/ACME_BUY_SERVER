import { Request, Response } from "express";
import SellerModel from "@/models/SellerModel";
import { apiReponse, apiReponseGeneralError } from "@/utils/apiReponse";
import argon2 from "argon2";
import createToken, { cookieOptions } from "@/utils/createToken";
import { AuthenticatedRequest } from "@/middlewares/authMiddleware";
import { RoleEnum, SellerStatusEnum } from "@/utils/enums";
import { randomDefaultImage } from "@/utils/imageSamples";

export default class authController {
  // Seller Signup
  static seller_signup = async (req: Request, res: Response) => {
    const { firstname, lastname, email, password, signupMethod, shopName } =
      req.body;

    try {
      // check email existing
      const existingUser = await SellerModel.findOne({ email });
      if (existingUser) {
        return apiReponse(res, 409, { error: "Email already exists." });
      }

      const returnedSeller = await SellerModel.create({
        firstname,
        lastname,
        email,
        password,
        shopName,
        signupMethod,
        status: SellerStatusEnum.Pending,
        imageName: "default_avatar.png",
        imageUrl: randomDefaultImage(), // TODO: update the default image
      });

      // TODO: you might want to create seller_customer schema. See video 190
      const accessToken = createToken({
        id: (returnedSeller.toJSON() as unknown as { id: string }).id,
        email,
        role: RoleEnum.Seller,
      }); // the reason to include id and role is to ensure a unique token for each user
      res.cookie("accessToken", accessToken, cookieOptions);
      return apiReponse(res, 201, {
        message: "New seller successfully created.",
        accessToken,
      }); // TODO: remove accessToken later, not recommended
    } catch (e) {
      return apiReponseGeneralError(res, e as Error);
    }
  };

  // Seller Login
  static seller_login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const seller = await SellerModel.findOne({ email }).collation({
        locale: "en",
        strength: 2,
      });

      if (seller) {
        if (await argon2.verify(seller.password, password)) {
          // generate cookie
          const accessToken = createToken({
            id: seller.id,
            email,
            role: RoleEnum.Seller,
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

  static get_user = async (req: AuthenticatedRequest, res: Response) => {
    const { email } = req; // get from middleware

    try {
      const seller = await SellerModel.findOne({ email }).collation({
        locale: "en",
        strength: 2,
      });

      if (seller) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, createdAt, updatedAt, ...rest } = seller.toJSON();
        return apiReponse(res, 200, {
          userInfo: rest,
          role: RoleEnum.Seller,
        });
      } else {
        apiReponse(res, 404, { message: "User not found." });
      }
    } catch (e) {
      return apiReponseGeneralError(res, e as Error);
    }
  };
}
