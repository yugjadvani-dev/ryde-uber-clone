import express from "express";
import {signIn, signOut, signUp} from "../controllers/auth.controllers";
import upload from "../middlewares/multer.middleware";

const router = express.Router();

router.post("/sign-up", upload.single("avatar"), signUp) // User signUp
router.post("/sign-in", signIn) // User signIn
router.post("/sign-out", signOut) // User signOut

export default router;