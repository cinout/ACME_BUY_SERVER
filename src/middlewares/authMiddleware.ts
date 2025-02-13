import { apiReponse } from "@/utils/apiReponse";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { RoleEnum } from "@/utils/enums";

export interface AuthenticatedRequest extends Request {
  id?: string;
  role?: RoleEnum;
  email?: string;
}

async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const accessToken = req.cookies.accessToken;

  // if (!accessToken) {
  //   return apiReponse(res, 401, {
  //     error: "Authentication failed. Please login again.",
  //   });
  // } else

  if (accessToken) {
    try {
      const tokenDecoded = jwt.verify(
        accessToken,
        process.env.AUTH_SECRET as string
      ) as Record<string, unknown>;

      req.id = tokenDecoded.id as string;
      req.role = tokenDecoded.role as RoleEnum;
      req.email = tokenDecoded.email as string;
    } catch (e) {
      return apiReponse(res, 401, {
        error: `Authentication ${
          (e as Error).name === "TokenExpiredError" ? "expired" : "failed"
        }. Please login again.`,
      });
    }
  }
  next();
}

export default authMiddleware;
