import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import passport from "./passport";
import taxonomyRoutes from "./routes/taxonomy.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import adminRoutes from "./routes/admin.routes";
import profileRoutes from "./routes/profile.routes";
import searchRoutes from "./routes/search.routes";
import helmet from "helmet";
import addressRoutes from "./routes/address.routes";
import reviewRoutes  from "./routes/review.routes";
import paymentRoutes from "./routes/payment.routes";
import { errorHandler } from "./middleware/error.middleware";
import fs from "fs";




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

app.use(helmet({
  // crossOriginResourcePolicy must be set to cross-origin
  // so express.static can serve product images to Angular
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"], // allow images from same origin, data URIs, and blob URLs
      scriptSrc: ["'self'"], // allow scripts only from same origin
      styleSrc: ["'self'", "'unsafe-inline'"], // allow styles from same origin and inline styles (for Angular)
    },
  },
}));

app.use(compression({
  // Only compress responses larger than 1KB
  // Compressing tiny responses wastes CPU
  threshold: 1024,
}));

// --- Static Files ---
// Product images served directly - no auth needed
app.use("/images", express.static(path.join(__dirname, "../../ProductImages")));

app.use("/api/auth", authRoutes);
app.use("/api/taxonomy", taxonomyRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/products/:productId/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);

// Serve Angular build output from dist folder in production.
    const angularDistRoot = path.join(
      __dirname,
      "../../frontend/dist/frontend",
    );
    const angularBrowserPath = path.join(angularDistRoot, "browser");
    const angularDistPath = fs.existsSync(angularBrowserPath)
      ? angularBrowserPath
      : angularDistRoot;
    app.use(express.static(angularDistPath));

 
    // SPA fallback for non-API routes.
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(angularDistPath, "index.html"));
    });


app.use(errorHandler);

export default app;