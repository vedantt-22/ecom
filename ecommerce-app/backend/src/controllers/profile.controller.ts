// src/controllers/profile.controller.ts

import { Request, Response } from "express";
import { profileService }    from "../services/profile.service";
import { asyncHandler } from "../middleware/error.middleware";

export class ProfileController {

  getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const currentUser = req.user as any;

      const result = await profileService.getProfile(
        currentUser.id,
        currentUser.jti
      );

      res.status(result.statusCode).json({
        user: {
          id:    currentUser.id,
          name:  currentUser.name,
          email: currentUser.email,
          role:  currentUser.role,
        },
        sessions: result.activeSessions,
      });
  });

  editProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const currentUser    = req.user as any;
    const { name, email } = req.body;

      const result = await profileService.editProfile(
        currentUser.id,
        name,
        email
      );

      if (!result.success) {
        res.status(result.statusCode).json({ error: result.message });
        return;
      }

      res.status(result.statusCode).json({ message: result.message });
  });

  changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const currentUser = req.user as any;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: "Current password and new password are required.",
        });
        return;
      }

      const result = await profileService.changePassword(
        currentUser.id,
        currentUser.jti,
        currentPassword,
        newPassword
      );

      if (!result.success) {
        res.status(result.statusCode).json({ error: result.message });
        return;
      }

      res.status(result.statusCode).json({ message: result.message });
  });
}

export const profileController = new ProfileController();