import authMiddleware from "@/middlewares/authMiddleware";
import express from "express";
import categoryController from "@/controllers/admin/categoryController";

const router = express.Router();

router.post("/category-add", authMiddleware, categoryController.category_add);

export default router;
