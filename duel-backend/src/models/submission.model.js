import mongoose, { Schema } from "mongoose";

const testResultSchema = new Schema({
    passed: {
        type: Boolean,
        required: true
    },
    input: String,
    expectedOutput: String,
    actualOutput: String,
    executionTime: Number,
    memory: Number,
    error: String
}, { _id: false });

const submissionSchema = new Schema({
    matchId: {
        type: Schema.Types.ObjectId,
        ref: "Match",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ['javascript', 'python', 'cpp', 'java', 'c'],
        default: "javascript"
    },
    problemId: {
        type: String,
        required: true
    },
    passedCount: {
        type: Number,
        default: 0
    },
    totalCount: {
        type: Number,
        default: 0
    },
    executionTime: {
        type: Number,
        default: 0
    },
    memory: {
        type: Number,
        default: 0
    },
    finalScore: {
        type: Number,
        default: 0
    },
    testResults: [testResultSchema],
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

export const Submission = mongoose.model("Submission", submissionSchema)