import passport from "passport";
import {
  Strategy as JwtStrategy,
  StrategyOptions
} from "passport-jwt";
import { Request } from "express";
import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import { sessionStore } from "./store/sessionStore";

export const JWT_SECRET  = process.env.JWT_SECRET || "vedant-is-active";
export const COOKIE_NAME = "token";

// Custom extractor to grab the JWT from the Cookie
function cookieExtractor(req: Request): string | null {
  if (req && req.cookies) {
    return req.cookies[COOKIE_NAME] ?? null;
  }
  return null;
}

const options: StrategyOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: JWT_SECRET,
  passReqToCallback: true, // This allows us to access 'req' in the verify function
};

passport.use(
  new JwtStrategy(
    options,
    // FIX: The order must be (req, payload, done) 
    // Note: Some versions/types might expect (payload, done) if passReqToCallback is false.
    async (req: Request, payload: any, done: (err: any, user?: any, info?: any) => void) => {
      try {
        const { jti, id } = payload;

        // 1. Session Store Check (The "Kill Switch")
        const session = sessionStore.get(jti);
        if (!session) {
          return done(null, false, {
            message: "Session expired or revoked. Please log in again.",
          });
        }

        // 2. User Existence Check
        const user = await AppDataSource
          .getRepository(User)
          .findOne({
            where: { id },
            // Only select necessary fields for security
            select: ["id", "name", "email", "role", "isLocked"],
          });

        if (!user) {
          return done(null, false, { message: "User account not found." });
        }

        // 3. Account Lock Check
        if (user.isLocked) {
          sessionStore.delete(jti); // Force logout by removing session
          return done(null, false, {
            message: "Your account has been locked. Please contact support.",
          });
        }

        // SUCCESS: Passport attaches this object to 'req.user'
        // We include jti so the logout route knows which session to kill
        return done(null, { ...user, jti });

      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;