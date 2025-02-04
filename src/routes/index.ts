import express from "express";
import authRoutes from "@/routes/authRoute";
import categoryRoutes from "@/routes/admin/categoryRoute";
import { expressMiddleware } from "@apollo/server/express4";
import { gqlServer } from "./graphql";
import authMiddleware from "@/middlewares/authMiddleware";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin/category", categoryRoutes);

async function initializeGraphQL() {
  await gqlServer.start(); // Ensure the server is started
  // Apollo Studio Explorer: http://localhost:8000/api/graphql
  router.use("/graphql", authMiddleware, expressMiddleware(gqlServer));
}

initializeGraphQL(); // Initialize GraphQL middleware
export default router;
