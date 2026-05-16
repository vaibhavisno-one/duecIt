import express from "express"
import { joinMatchQueue, leaveMatchQueue, getQueue, getMatchById, endMatch } from "../controllers/match.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/queue/join", verifyJWT, joinMatchQueue)
router.post("/queue/leave", verifyJWT, leaveMatchQueue)
router.get("/queue/status", verifyJWT, getQueue)

router.get("/:id", verifyJWT, getMatchById)
router.patch("/:id/end", verifyJWT, endMatch)

export default router