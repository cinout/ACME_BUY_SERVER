import express from "express";
import authController from "@/controllers/authController";
import authMiddleware from "@/middlewares/authMiddleware";

const router = express.Router();
// TODO:[2] move them to graphql

// User Signup
router.post("/user-signup", authController.user_signup);

// User Login
router.post("/user-login", authController.user_login);

// Log Out
// router.post("/logout", authMiddleware, authController.logout);

export default router;
