import express from "express";
import authRoutes from "./auth.routes"
import userRoutes from "./user.routes"

// Initialize the router
const router = express.Router();

router.use("/auth", authRoutes); // Auth routes
router.use("/user", userRoutes) // User routes

export default router;