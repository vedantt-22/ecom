import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {

    console.error("Error:", err); // Log the error for debugging

    // Customize the response based on error type or properties
    if (err.name === "UnauthorizedError") {
        res.status(401).json({ error: "Unauthorized: Invalid token." });
    }
    else if (err.name === "ValidationError") {
        res.status(400).json({ error: "Bad Request: Validation failed.", details: err.message });
    }
    else {
        res.status(500).json({ error: "Internal Server Error: An unexpected error occurred." });
    }
}

export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };