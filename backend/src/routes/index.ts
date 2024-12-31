import express from "express";
import authRoutes from "./auth.routes"
import userRoutes from "./user.routes"

// Initialize the router
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes)

export default router;