import express from "express";
import authRoutes from "./auth.routes"

// Initialize the router
const router = express.Router();

router.use("/auth", authRoutes);

export default router;