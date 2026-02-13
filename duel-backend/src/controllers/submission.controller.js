// submitCode

// Read matchId from req.params
// Read code from req.body
// Read user from req.user
// Validate:
// match exists
// match is active
// user is part of match
// Fake evaluate code (v1)
// Save submission
// End match
// Return result

import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Match } from "../models/match.model.js";
import { Submission } from "../models/submission.model.js";

const submitCode = asyncHandler(async (req, res) => {
    const { matchId } = req.params

    const { code } = req.body;
    const userId = req.user._id
    const match = await Match.findById(matchId)

    if (!match) {
        throw new ApiError(400, "match not found")
    }

    if (!code) {
        throw new ApiError(400, "code not found")
    }

    if (userId.toString() !== match.playerA.toString() && userId.toString() !== match.playerB.toString()) {
        throw new ApiError(400, "user is not part of match")
    }

    if (match.status != ("active")) {
        throw new ApiError(400, "match is not active")
    }

    // temporary fake evaluation
    const result = {
        passedCount: 8,
        totalCount: 10,
        executionTime: 120,
        finalScore: 85
    };


    //save submission

    const submission = await Submission.create({
        matchId,
        userId,
        code,
        ...result
    })


    // end match
    match.status = "finished"
    match.endTime = new Date()
    match.winner = userId;

    await match.save()

    return res.status(200).json(
        new ApiResponse(200, submission, "Code submitted successfully")
    )


})