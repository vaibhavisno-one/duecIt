import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  problemId: {
    type: String,
    required: true,
    index: true
  },
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  sizeBucket: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  isHidden: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

testCaseSchema.index({ problemId: 1, sizeBucket: 1 });

export default mongoose.model('TestCase', testCaseSchema);