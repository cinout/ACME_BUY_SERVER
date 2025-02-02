import { Response } from "express";

export const apiReponse = (
  res: Response,
  status: number,
  data: Record<string, unknown>
) => {
  return res.status(status).json(data);
};

export const apiReponseGeneralError = (res: Response, err: Error) => {
  // TODO: should return a general message in PRD environment
  return res.status(500).json({ error: err.message });
};
