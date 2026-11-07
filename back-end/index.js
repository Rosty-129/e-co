import express from "express";
import cors from "cors";
import helmet from "helmet";
import { generalLimiter } from "./middleware/rateLimit.js";
import authRoutes from "./routes/authroutes.js";
import cartRoutes from "./routes/cartroute.js";
import categoryRoutes from "./routes/categoryroute.js";
import dashboardRoutes from "./routes/dashboardroute.js";
import imagesRoutes from "./routes/imagesroute.js";
import orderRoutes from "./routes/orderroute.js";
import productRoutes from "./routes/productsroute.js";
import profileRoutes from "./routes/profileroute.js";
import reviewRoutes from "./routes/reviewroute.js";

const app = express();

// Remove Express framework identification
app.disable("x-powered-by");

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    "https://e-co-ochre.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Parse JSON requests
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "API is running"
  });
});

app.use(generalLimiter);

// Authentication
app.use("/auth", authRoutes);

// Categories
app.use("/category", categoryRoutes);

// Products
app.use("/product", productRoutes);

// Cart
app.use("/cart", cartRoutes);

// Orders
app.use("/order", orderRoutes);

// Reviews
app.use("/review", reviewRoutes);

// Profile
app.use("/profile", profileRoutes);

// Product images
app.use("/images", imagesRoutes);

// Admin dashboard
app.use("/dashboard", dashboardRoutes);

// Export for Vercel serverless
export default app;