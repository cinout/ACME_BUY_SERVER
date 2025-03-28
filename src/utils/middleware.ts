import { Request, Response } from "express";
import logger from "./logger";

// handler of request of unknown endpoints
const unknownEndpoint = (request: Request, response: Response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// const errorHandler = (error, request, response, next) => {
//   logger.error(error.message);

//   // TODO:[3] change the following code
//   if (error.name === "CastError") {
//     return response.status(400).send({ error: "malformatted id" });
//   } else if (error.name === "ValidationError") {
//     return response.status(400).json({ error: error.message });
//   }
//   next(error);
// };

export { unknownEndpoint };
