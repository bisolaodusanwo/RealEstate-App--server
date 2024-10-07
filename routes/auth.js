import express from "express";
import {
  welcome,
  preRegister,
  register,
  login,
  forgotPassword,
  accessAccount,
  refreshToken,
  currentUser,
  publicProfile,
  updatePassword,
} from "../controllers/authController.js";
import { requireSignin } from "../middlewares/auth.js";
const router = express.Router();

// Routes
router.get("/", requireSignin, welcome);
router.post("/pre-register", preRegister);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/access-account", accessAccount);
router.post("/refresh-token", refreshToken);
router.get("/current-user", requireSignin, currentUser);
router.get("/profile/:username", publicProfile);
router.put("/update-password", requireSignin, updatePassword);
export default router;
