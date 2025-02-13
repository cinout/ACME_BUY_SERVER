import express from "express";
import authRoutes from "@/routes/authRoute";
import { expressMiddleware } from "@apollo/server/express4";
import { gqlServer } from "./graphqlRoute";
import authMiddleware, {
  AuthenticatedRequest,
} from "@/middlewares/authMiddleware";
// import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";

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
      context: async ({ req }: { req: AuthenticatedRequest }) => {
        const role = req.role!;
        const email = req.email!;
        const id = req.id!;
        return { id, role, email };
      },
    })
  );
}

initializeGraphQL(); // Initialize GraphQL middleware
export default router;
