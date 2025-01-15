import express from "express";
import authRoutes from "@/routes/authRoute";
const router = express.Router();

router.use("auth", authRoutes);

export default router;
