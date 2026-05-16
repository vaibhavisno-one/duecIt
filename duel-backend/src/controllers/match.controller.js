import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/AsyncHandler.js"
import { Match } from "../models/match.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { joinQueue, leaveQueue, getQueueStatus } from "../services/matchmaking.service.js"

// joinMatchQueue
// leaveMatchQueue
// getQueueStatus
// getMatchById
// endMatch

const joinMatchQueue = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { difficulty } = req.body;

    if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
        throw new ApiError(400, "Invalid difficulty");
    }

    const queueEntry = await joinQueue(userId, difficulty);

    return res.status(200).json(
        new ApiResponse(200, queueEntry, "Joined matchmaking queue")
    );
});

const leaveMatchQueue = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const removed = leaveQueue(userId);

    if (!removed) {
        throw new ApiError(400, "Not in queue");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Left matchmaking queue")
    );
});

const getQueue = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const status = getQueueStatus(userId);

    if (!status) {
        throw new ApiError(404, "Not in queue");
    }

    return res.status(200).json(
        new ApiResponse(200, status, "Queue status fetched")
    );
});

const getMatchById = asyncHandler(async (req, res) => {
    const match = await Match.findById(req.params.id)
        .populate('playerA', 'username rating')
        .populate('playerB', 'username rating')
        .populate('submissions');

    if (!match) {
        throw new ApiError(404, "Match not found");
    }

    const userId = req.user._id.toString();

    if (
        match.playerA._id.toString() !== userId &&
        match.playerB._id.toString() !== userId
    ) {
        throw new ApiError(403, "Not authorized");
    }

    return res.status(200).json(
        new ApiResponse(200, match, "Match fetched")
    );
});

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
        throw new ApiError(403, "Not authorized");
    }

    if (match.status === "finished") {
        throw new ApiError(400, "Match already finished");
    }

    match.status = "finished";
    match.endTime = new Date();
    await match.save();

    return res.status(200).json(
        new ApiResponse(200, match, "Match ended")
    );
});

export { joinMatchQueue, leaveMatchQueue, getQueue, getMatchById, endMatch }