import mongoose from 'mongoose';

const sampleSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  }
}, { _id: false });

const problemSchema = new mongoose.Schema({
  problemId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  statement: {
    type: String,
    required: true
  },
  inputFormat: {
    type: String,
    required: true
  },
  outputFormat: {
    type: String,
    required: true
  },
  constraints: {
    type: String,
    required: true
  },
  samples: {
    type: [sampleSchema],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'At least one sample is required'
    }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    index: true
  },
  tags: {
    type: [String],
    default: []
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

export default mongoose.model('Problem', problemSchema);