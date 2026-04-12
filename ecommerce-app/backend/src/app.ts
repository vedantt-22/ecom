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
}));

app.use(compression({
  // Only compress responses larger than 1KB
  // Compressing tiny responses wastes CPU
  threshold: 1024,
}));

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
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/products/:productId/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);

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

app.use(errorHandler);

export default app;