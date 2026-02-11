import mongoose, { Schema } from "mongoose";

const matchSchema = new Schema({
    playerA:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    playerB:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    problemId:{
        type:String,
        required:true

    },
    status: { 
        type: String,
        enum: ['waiting','active','finished'],
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
    submissions:[
        {
            type:Schema.Types.ObjectId,
            ref:"Submission"
        }
    ]
    
})

export const Match = mongoose.model("Match", matchSchema)