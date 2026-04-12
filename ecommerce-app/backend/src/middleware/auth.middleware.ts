import { Request, Response, NextFunction } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
export function requireAuth(req: Request, res: Response, next: NextFunction): void { 
    //checks if the user is Authenticated by verifying the JWT in the cookie using Passport's JWT strategy.
    passport.authenticate("jwt", { session: false }, (err:any, user: any, info: any) => {
        if(err) { //If the database crashes or something explodes, we return a 500 Internal Server Error.
            res.status(500).json({ error: "An error occurred during authentication." });
            return;
        }
        if(!user) { // If the token is expired, fake, or missing, we return a 401 Unauthorized.
            res.status(401).json({ error: info?.message || "Unauthorized" });
            return;
        }
        req.user = user; //attach user to request
        next();
    })(req, res, next); // invoke the middleware immediately with the req, res, next parameters
    
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
    passport.authenticate("jwt", { session: false }, (_err: any, user: any) => {
        req.user = user || undefined;
        next();
    })(req, _res, next);
}

export function isGuest(req: Request, res: Response, next: NextFunction): void {
    const token = req.cookies?.["token"];
    if(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            res.status(400).json({ message: "You are already authenticated.", user: decoded, redirect: "/dashboard" });
            return;
        } catch (error) {
            res.clearCookie("token"); // Clear the invalid token
            next(); // Proceed to the next middleware or route handler
        }
    }
    else {
    next();
    }
}


