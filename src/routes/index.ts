import express, { Response } from "express";
import authRoutes from "@/routes/authRoute";
import { expressMiddleware } from "@apollo/server/express4";
import { gqlServer } from "./graphqlRoute";
import authMiddleware, {
  AuthenticatedRequest,
} from "@/middlewares/authMiddleware";
import {
  genreDataLoader,
  Loaders,
  productDataLoader,
  userDataLoader,
} from "@/db/dataloders";
import { RoleEnum } from "@/utils/enums";

export interface GqlRouteContext {
  id: string;
  role: RoleEnum;
  email: string;
  res: Response;
  loaders: Loaders;
}

const router = express.Router();

router.use("/auth", authRoutes);

async function initializeGraphQL() {
  await gqlServer.start(); // Ensure the server is started

  // Apollo Studio Explorer: http://localhost:8000/api/graphql
  router.use(
    "/graphql",
    authMiddleware,
    expressMiddleware(gqlServer, {
      // add to context param in resolvers
      context: async ({
        req,
        res,
      }: {
        req: AuthenticatedRequest;
        res: Response;
      }) => {
        const role = req.role!;
        const email = req.email!;
        const id = req.id!;
        const loaders = {
          genreDataLoader,
          userDataLoader,
          productDataLoader,
        };
        return { id, role, email, res, loaders };
      },
    })
  );
}

initializeGraphQL(); // Initialize GraphQL middleware
export default router;
