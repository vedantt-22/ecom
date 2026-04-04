import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import passport from "./passport";
import taxonomyRoutes from "./routes/taxonomy.routes";
import productRoutes from "./routes/product.routes";

dotenv.config();

const app = express();

// --- Security & Parsing Middleware ---
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? "http://localhost:3000"   // same origin in prod
    : "http://localhost:4200",  // Angular dev server
  credentials: true,           // allow cookies to be sent
}));

app.use(cookieParser());
app.use(passport.initialize());
app.use(express.json());           // parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // parse form data

// --- Static Files ---
// Product images served directly - no auth needed
app.use("/images", express.static(path.join(__dirname, "../../ProductImages")));

// Angular build output served in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(
    path.join(__dirname, "../../frontend/dist/frontend")
  ));
}

app.use("/api/auth", authRoutes);
app.use("/api/taxonomy", taxonomyRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);



// --- API Routes (will be added in later steps) ---
// app.use("/api/auth", authLimiter, authRoutes);
// app.use("/api/products", productRoutes);
// etc.

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong on our end!" });
});

// --- Angular catch-all (Step 20) ---
// Must be LAST - after all API routes
if (process.env.NODE_ENV === "production") {
  app.use(express.static(
    path.join(__dirname, "../../frontend/dist/frontend/browser")
  ));
  app.get("*", (_req, res) => {
    res.sendFile(
      path.join(__dirname, "../../frontend/dist/frontend/browser/index.html")
    );
  });
}

export default app;