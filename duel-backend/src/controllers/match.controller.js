import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/AsyncHandler.js"
import { Match } from "../models/match.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { getRandomProblem } from "../services/problem-service.js"


// startMatch
// getMatchById
// endMatch


const startMatch = asyncHandler(async (req, res, next) => {

    const userId = req.user._id


    const problem = await getRandomProblem()

    if (!problem) {
        throw new ApiError(400, "Unable to get problem")
    }



    const match = await Match.create({
        playerA: userId,
        playerB: userId,
        problemId: problem.id,
        status: "active",
        startTime: Date.now(),
    })

    return res.status(200).json(
        new ApiResponse(200, match, "Match started successfully")
    )


})

//getMatchById

const getMatchById = asyncHandler(async (req, res) => {
    const match = await Match.findById(req.params.id);

    if (!match) {
        throw new ApiError(404, "Match not found");
    }

    const userId = req.user._id.toString();

    if (
        match.playerA.toString() !== userId &&
        match.playerB.toString() !== userId
    ) {
        throw new ApiError(403, "Not authorized to view this match");
    }

    return res.status(200).json(
        new ApiResponse(200, match, "Match fetched successfully")
    );
});


//endMatch

const endMatch = asyncHandler(async (req, res) => {
    const match = await Match.findById(req.params.id);

    if (!match) {
        throw new ApiError(404, "Match not found");
    }

    const userId = req.user._id.toString();

    if (
        match.playerA.toString() !== userId &&
        match.playerB.toString() !== userId
    ) {
        throw new ApiError(403, "Not authorized to end this match");
    }

    if (match.status === "finished") {
        throw new ApiError(400, "Match already finished");
    }

    match.status = "finished";
    match.endTime = new Date();
    await match.save();

    return res.status(200).json(
        new ApiResponse(200, match, "Match ended successfully")
    );
});

export { startMatch, getMatchById, endMatch }