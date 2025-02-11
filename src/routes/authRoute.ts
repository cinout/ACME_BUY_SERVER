import express from "express";
import authController from "@/controllers/authController";
import authMiddleware from "@/middlewares/authMiddleware";

const router = express.Router();

// Admin Login
router.post("/admin-login", authController.admin_login);

// Seller Signup
router.post("/seller-signup", authController.seller_signup);

// Seller Login
router.post("/seller-login", authController.seller_login);

// Get User Info
router.get("/get-user", authMiddleware, authController.get_user);

// Log Out
router.post("/logout", authMiddleware, authController.logout);

export default router;
