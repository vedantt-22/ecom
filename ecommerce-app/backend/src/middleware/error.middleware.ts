import { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  // Log internally — full error for debugging.
  console.error("Unhandled error:", err.message);
  console.error(err.stack);

  // Passport/JWT authentication errors
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized: Invalid token." });
    return;
  }

  // Generic validation style errors
  if (err.name === "ValidationError") {
    res.status(400).json({ error: "Bad Request: Validation failed." });
    return;
  }

  // Foreign key constraint — trying to delete something referenced by another table
  if (
    err.message?.includes("FOREIGN KEY") ||
    err.message?.includes("SQLITE_CONSTRAINT")
  ) {
    res.status(409).json({
      error: "This operation failed due to existing related data.",
    });
    return;
  }

  // Multer file type rejection
  if (err.message?.includes("Only JPEG, PNG")) {
    res.status(400).json({ error: err.message });
    return;
  }

  // Multer file size rejection
  const errorWithCode = err as Error & { code?: string };
  if (errorWithCode.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({ error: "File too large. Maximum size is 5MB." });
    return;
  }

  // Unknown errors: never expose internals.
  res.status(500).json({
    error: "An unexpected error occurred. Please try again.",
  });
}




export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };