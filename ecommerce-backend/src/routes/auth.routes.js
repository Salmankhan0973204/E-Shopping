import express from "express";
import { register, login, refresh, logout, verifyEmailController } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login",    login);
router.post("/refresh",  refresh);
router.post("/logout",   protect, logout); 
router.get("/verify-email", verifyEmailController);

export default router;