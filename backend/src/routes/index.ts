import express from "express";
import {registerUser} from "../controllers/auth.controllers";

// Initialize the router
const router = express.Router();

router.use("/auth", registerUser);

export default router;