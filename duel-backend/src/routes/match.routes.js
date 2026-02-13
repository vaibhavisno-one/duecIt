import express from "express"

import { startMatch, getMatchById, endMatch } from "../controllers/match.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/", verifyJWT, startMatch)

router.get("/:id", verifyJWT, getMatchById)

router.patch("/:id/end", verifyJWT, endMatch)


export default router