import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Match } from "../models/match.model.js";
import { Submission } from "../models/submission.model.js";
import { executeCode, getTestCasesFromProblemService } from "../services/judge.service.js";
import { updatePlayerRatings } from "../utils/elo.util.js";
import { User } from "../models/user.model.js";
import { emitToMatch } from "../services/socket.service.js";

const submitCode = asyncHandler(async (req, res) => {
    const { matchId } = req.params;
    const { code, language = "javascript" } = req.body;
    const userId = req.user._id;

    if (!code) {
        throw new ApiError(400, "Code required");
    }

    const match = await Match.findById(matchId);

    if (!match) {
        throw new ApiError(404, "Match not found");
    }

    if (
        userId.toString() !== match.playerA.toString() &&
        userId.toString() !== match.playerB.toString()
    ) {
        throw new ApiError(403, "Not in this match");
    }

    if (match.status !== "active") {
        throw new ApiError(400, "Match not active");
    }

    const existingSubmission = await Submission.findOne({
        matchId,
        userId
    });

    if (existingSubmission) {
        throw new ApiError(400, "Already submitted");
    }

    const testCases = await getTestCasesFromProblemService(match.problemId);

    const result = await executeCode(code, language, testCases);

    const submission = await Submission.create({
        matchId,
        userId,
        code,
        language,
        problemId: match.problemId,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        executionTime: result.executionTime,
        memory: result.memory,
        finalScore: result.finalScore,
        testResults: result.testResults
    });

    match.submissions.push(submission._id);
    await match.save();

    emitToMatch(matchId.toString(), 'submission:received', {
        userId: userId.toString(),
        username: req.user.username,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        finalScore: result.finalScore
    });

    const bothSubmitted = match.submissions.length === 2;

    if (bothSubmitted) {
        await finalizeMatch(match);
    }

    return res.status(200).json(
        new ApiResponse(200, {
            submission,
            matchFinished: bothSubmitted
        }, "Code submitted")
    );
});

const finalizeMatch = async (match) => {
    const submissions = await Submission.find({
        matchId: match._id
    }).sort({ finalScore: -1, executionTime: 1 });

    if (submissions.length !== 2) {
        return;
    }

    const [first, second] = submissions;

    let winnerId;
    let loserId;

    if (first.finalScore > second.finalScore) {
        winnerId = first.userId;
        loserId = second.userId;
    } else if (first.finalScore < second.finalScore) {
        winnerId = second.userId;
        loserId = first.userId;
    } else {
        if (first.executionTime < second.executionTime) {
            winnerId = first.userId;
            loserId = second.userId;
        } else {
            winnerId = second.userId;
            loserId = first.userId;
        }
    }

    const ratingChanges = await updatePlayerRatings(User, winnerId, loserId);

    match.winner = winnerId;
    match.status = "finished";
    match.endTime = new Date();
    match.ratingChanges = {
        playerA: winnerId.toString() === match.playerA.toString() 
            ? ratingChanges.winner.change 
            : ratingChanges.loser.change,
        playerB: winnerId.toString() === match.playerB.toString() 
            ? ratingChanges.winner.change 
            : ratingChanges.loser.change
    };

    await match.save();

    emitToMatch(match._id.toString(), 'match:finished', {
        winner: {
            userId: winnerId.toString(),
            username: ratingChanges.winner.username,
            score: winnerId.toString() === first.userId.toString() ? first.finalScore : second.finalScore,
            executionTime: winnerId.toString() === first.userId.toString() ? first.executionTime : second.executionTime,
            ratingChange: ratingChanges.winner.change,
            newRating: ratingChanges.winner.newRating
        },
        loser: {
            userId: loserId.toString(),
            username: ratingChanges.loser.username,
            score: loserId.toString() === first.userId.toString() ? first.finalScore : second.finalScore,
            executionTime: loserId.toString() === first.userId.toString() ? first.executionTime : second.executionTime,
            ratingChange: ratingChanges.loser.change,
            newRating: ratingChanges.loser.newRating
        },
        bestSubmission: first.code
    });

    console.log(`🏆 Match finished: ${ratingChanges.winner.username} wins!`);
};

export { submitCode };