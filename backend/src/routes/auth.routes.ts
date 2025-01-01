import express from "express";
import {signIn, signOut, signUp} from "../controllers/auth.controllers";

const router = express.Router();

router.post("/sign-up", signUp) // User signUp
router.post("/sign-in", signIn) // User signIn
router.post("/sign-out", signOut) // User signOut

export default router;