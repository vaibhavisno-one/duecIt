import express from "express"

import {submitCode} from "../controllers/submission.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router()


router.post("/:matchId", verifyJWT, submitCode)

export default router

