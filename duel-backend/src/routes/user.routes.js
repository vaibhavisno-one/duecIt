import express from "express"
import { registerUser, loginUser, loggedOutUser, getCurrentUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/register", registerUser)

router.post("/login", loginUser)

router.get("/me", verifyJWT, getCurrentUser)

router.post("/logout", verifyJWT, loggedOutUser)


export default router
