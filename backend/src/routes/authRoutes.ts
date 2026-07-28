import express from "express";
import { getNonce, login } from "../controllers/authController.js";

const router = express.Router();

router.get("/nonce/:publicKey", getNonce);
router.post("/login", login);

export default router;
