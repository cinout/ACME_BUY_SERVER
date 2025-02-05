import express, { Response } from "express";
import authRoutes from "@/routes/authRoute";
import categoryRoutes from "@/routes/admin/categoryRoute";
import { expressMiddleware } from "@apollo/server/express4";
import { gqlServer } from "./graphql";
import authMiddleware, {
  AuthenticatedRequest,
} from "@/middlewares/authMiddleware";
// import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin/category", categoryRoutes);

async function initializeGraphQL() {
  await gqlServer.start(); // Ensure the server is started
  // server.applyMiddleware({ app }); TODO: is this needed?

  // Apollo Studio Explorer: http://localhost:8000/api/graphql
  router.use(
    "/graphql",
    authMiddleware,
    expressMiddleware(gqlServer, {
      // add to context param in resolvers
      context: async ({ req }: { req: AuthenticatedRequest }) => {
        const role = req.role;
        const email = req.email;
        return { role, email };
      },
    })
  );
}

initializeGraphQL(); // Initialize GraphQL middleware
export default router;
