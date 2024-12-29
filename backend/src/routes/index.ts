import express from "express";
import {signUp} from "../controllers/auth.controllers";

// Initialize the router
const router = express.Router();

router.use("/auth", signUp);

export default router;