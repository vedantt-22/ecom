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

      // Log internally — full error for debugging
  console.error("Unhandled error:", err.message);
  console.error(err.stack);

  // ── Known error types ────────────────────────────────────
  // These are errors we can give meaningful messages for.

  // Foreign key constraint — trying to delete something
  // that is referenced by another table
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

  // ── Unknown errors ───────────────────────────────────────
  // Never expose internal details to the client.
  res.status(500).json({
    error: "An unexpected error occurred. Please try again.",
  });

}




export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };