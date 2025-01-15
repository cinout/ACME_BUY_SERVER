import { Request, Response } from "express";
export class authController {
  static admin_login = async (req: Request, res: Response) => {
    console.log(req.body);
  };
}
