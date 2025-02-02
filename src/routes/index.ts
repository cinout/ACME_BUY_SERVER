import express from "express";
import authRoutes from "@/routes/authRoute";
import categoryRoutes from "@/routes/admin/categoryRoute";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin/category", categoryRoutes);

export default router;
