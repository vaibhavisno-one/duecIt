import mongoose, { Schema } from "mongoose";

const matchSchema = new Schema({
    playerA:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    playerB:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    problemId:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard'],
        required:true
    },
    status: { 
        type: String,
        enum: ['waiting','active','finished','cancelled'],
        default: 'active'
    },
    winner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    startTime:{
        type:Date,
        default:Date.now
    },
    endTime:{
        type:Date,
    },
    problemReadTime:{
        type:Number,
        default:120
    },
    codingTime:{
        type:Number,
        default:1800
    },
    submissions:[
        {
            type:Schema.Types.ObjectId,
            ref:"Submission"
        }
    ],
    ratingChanges:{
        playerA:{
            type:Number,
            default:0
        },
        playerB:{
            type:Number,
            default:0
        }
    }
}, {
    timestamps:true
})

export const Match = mongoose.model("Match", matchSchema)