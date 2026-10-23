import express from "express";
import cors from "cors";

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

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});