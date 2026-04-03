// src/routes/profile.routes.ts

import { Router }            from "express";
import { profileController } from "../controllers/profile.controller";
import { requireAuth }       from "../middleware/auth.middleware";

const router = Router();

// All profile routes require authentication
router.use(requireAuth);

router.get("/", profileController.getProfile);

router.put("/", profileController.editProfile);

router.put("/change-password", profileController.changePassword);

export default router;