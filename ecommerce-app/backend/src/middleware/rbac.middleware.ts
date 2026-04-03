// middleware/rbac.middleware.ts
import { Request, Response, NextFunction } from "express";
import { UserRole } from "../entities/User";

export function requiredRole(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        // If requireAuth didn't run, we assume they are a guest
        const userRole = (req.user as any)?.role || "guest";

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({ 
                error: `Forbidden: ${userRole} does not have access.` 
            });
            return;
        }
        next();
    };
}