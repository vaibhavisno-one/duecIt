import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema({
    matchId:{
        type:Schema.Types.ObjectId,
        ref:"Match",
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    code:{
        type:String,
        required:true
    },
    passedCount:{
        type:Number,
        default:0
    },
    totalCount:{
        type:Number,
        default:0
    },
    finalScore:{
        type:Number,
        default:0
    },

    language: {
    type: String,
    default: "javascript"
    },
    executionTime:{
        type:Number,
        default:0
    },
    submittedAt:{
        type:Date,
        default:Date.now
    }
    
    
})
export const Submission = mongoose.model("Submission", submissionSchema)