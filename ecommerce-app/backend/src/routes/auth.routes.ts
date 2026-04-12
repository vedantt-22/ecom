import {Router} from "express";
import { authController } from "../controllers/auth.controller";
import { isGuest, optionalAuth, requireAuth } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimiter";


const router = Router();

router.get("/session", optionalAuth, authController.session);

router.post("/register", authLimiter, isGuest, authController.register);
router.post("/login", authLimiter, isGuest, authController.login);
router.post("/logout", requireAuth, authController.logout);
router.post("/forget-password", authLimiter, authController.forgetPassword);
router.post("/get-reset-code", authLimiter, authController.getResetCode);
router.post("/reset-password", authLimiter, authController.resetPassword);
router.post("/logout/:sessionId", requireAuth, authController.logoutSession);
router.post("/logout-all", requireAuth, authController.logoutAll);
export default router;

