import { Request, Response } from "express";
import AdminModel from "@/models/AdminModel";
import SellerModel from "@/models/SellerModel";
import { apiReponse, apiReponseGeneralError } from "@/utils/apiReponse";
import argon2 from "argon2";
import createToken, { cookieOptions } from "@/utils/createToken";
import { AuthenticatedRequest } from "@/middlewares/authMiddleware";
import { RoleEnum, SellerStatusEnum } from "@/utils/enums";

export default class authController {
  // Admin Login
  static admin_login = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { email, password } = req.body;
    try {
      const admin = await AdminModel.findOne({ email }).collation({
        locale: "en",
        strength: 2,
      });

      if (admin) {
        if (await argon2.verify(admin.password, password)) {
          // generate cookie
          const accessToken = createToken({
            id: admin.toJSON().id,
            email,
            role: RoleEnum.Admin,
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
        imageUrl:
          "http://res.cloudinary.com/dcavpobmc/image/upload/v1739189986/Products/goyrtskikfcxxbvtndtn.png", // TODO: update the default image
      });

      // TODO: you might want to create seller_customer schema. See video 190
      const accessToken = createToken({
        id: returnedSeller.toJSON().id,
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
    const { email, role } = req; // get from middleware

    try {
      if (role === RoleEnum.Admin) {
        const admin = await AdminModel.findOne({ email }).collation({
          locale: "en",
          strength: 2,
        });

        if (admin) {
          const { password, createdAt, updatedAt, ...rest } = admin.toJSON();
          return apiReponse(res, 200, {
            userInfo: rest,
            role: RoleEnum.Admin,
          });
        } else {
          apiReponse(res, 404, { message: "User not found." });
        }
      } else if (role === RoleEnum.Seller) {
        const seller = await SellerModel.findOne({ email }).collation({
          locale: "en",
          strength: 2,
        });

        if (seller) {
          const { password, createdAt, updatedAt, ...rest } = seller.toJSON();
          return apiReponse(res, 200, {
            userInfo: rest,
            role: RoleEnum.Seller,
          });
        } else {
          apiReponse(res, 404, { message: "User not found." });
        }
      }
      // TODO: customer role
    } catch (e) {
      return apiReponseGeneralError(res, e as Error);
    }
  };

  static logout = async (req: AuthenticatedRequest, res: Response) => {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
      });
      return apiReponse(res, 200, { message: "Loggout successfully." });
    } catch (e) {
      return apiReponseGeneralError(res, e as Error);
    }
  };
}
