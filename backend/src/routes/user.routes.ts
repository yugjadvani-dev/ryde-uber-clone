import express from "express";
import {getAllUsers} from "../controllers/user.controllers";

const router = express.Router();

router.post("/all-users", getAllUsers)

export default router;