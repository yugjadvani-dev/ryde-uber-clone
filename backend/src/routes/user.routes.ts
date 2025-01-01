import express from "express";
import {getAllUsers} from "../controllers/user.controllers";
import adminMiddleware from "../middlewares/admin.middleware";

const router = express.Router();

router.get("/all-users", adminMiddleware, getAllUsers) // Get all the users

export default router;