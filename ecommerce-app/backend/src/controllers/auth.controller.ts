import { Request, Response } from "express";
import { authService }       from "../services/auth.service";
import { COOKIE_NAME }       from "../passport";
import { asyncHandler }      from "../middleware/error.middleware";


const COOKIE_OPTIONS = {
  httpOnly: true, // prevent client-side JS access to the cookie
  secure:   process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
  sameSite: "strict" as const, //CSRF (Cross Site Request Forgery) protection
  maxAge:   7 * 24 * 60 * 60 * 1000, //Time until cookie expires (7 days)
};

export class AuthController {

  session = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const user = req.user as any;

      if (!user) {
        res.status(200).json({ authenticated: false, user: null });
        return;
      }

      res.status(200).json({
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  });

  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({
          error: "Name, email and password are required.",
        });
        return;
      }

      const result = await authService.register(name, email, password);

      if (!result.success) {
        res.status(result.statusCode).json({ errors: result.errors });
        return;
      }

      res.status(result.statusCode).json({ message: result.message });
  });
  //Login
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required." });
        return;
      }

      const ip        = req.ip ?? "unknown";
      const userAgent = req.headers["user-agent"] ?? "unknown";

      const result = await authService.login(email, password, ip, userAgent);

      if (!result.success) {
        res.status(result.statusCode).json({ error: result.message });
        return;
      }

      res.cookie(COOKIE_NAME, result.token!, COOKIE_OPTIONS);

      res.status(result.statusCode).json({
        message: "Login successful.",
        user:    result.user,
      });
  });

  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const user = req.user as any;
      if (!user || !user.jti) {
        res.status(400).json({ error: "Invalid session." });
        return;
      }
      await authService.logout(user.jti);
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/" // Ensure the path matches (defaults to '/')
      });

      res.status(200).json({ message: "Logged out successfully." });
  });

  logoutSession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const currentUser      = req.user as any;
      const { sessionId }    = req.params;
      const result = await authService.logoutSession(
        sessionId,
        currentUser.id
      );

      if (!result.success) {
        res.status(result.statusCode).json({ error: result.message });
        return;
      }

      res.status(result.statusCode).json({ message: result.message });
  });
  // Logout all sessions for the current user
  logoutAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const user = req.user as any;

      await authService.logoutAll(user.id);

      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        sameSite: "strict",
      });

      res.status(200).json({ message: "All sessions terminated." });
  });
  // FORGET PASSWORD
  forgetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: "Email is required." });
        return;
      }

      const result = await authService.forgetPassword(email);
      res.status(result.statusCode).json({
        message: result.message,
        // Only present if user was found and code was generated
        ...(result.code && { code: result.code }),
        ...(result.expiresAt && { expiresAt: result.expiresAt }),
      });
  });

  getResetCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: "Email is required." });
        return;
      }

      const result = await authService.getResetCode(email);

      if (!result.success) {
        res.status(result.statusCode).json({ error: result.message });
        return;
      }

      res.status(result.statusCode).json({
        message: result.message,
        code: result.code,
        expiresAt: result.expiresAt,
      });
  });

  // RESET PASSWORD
  resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        res.status(400).json({
          error: "Email, code and new password are required.",
        });
        return;
      }

      const result = await authService.resetPassword(
        email,
        code,
        newPassword
      );

      if (!result.success) {
        res.status(result.statusCode).json({ error: result.message });
        return;
      }

      res.status(result.statusCode).json({ message: result.message });
  });
}
export const authController = new AuthController();