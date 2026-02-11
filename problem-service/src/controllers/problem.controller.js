import Problem from '../models/problem.model.js';

export const getRandomProblem = async (req, res) => {
  try {
    const { difficulty } = req.query;

    if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid difficulty. Must be one of: easy, medium, hard'
      });
    }

    const count = await Problem.countDocuments({ difficulty });

    if (count === 0) {
      return res.status(404).json({
        success: false,
        error: `No problems found with difficulty: ${difficulty}`
      });
    }

    const random = Math.floor(Math.random() * count);
    const problem = await Problem.findOne({ difficulty })
      .skip(random)
      .select('-__v');

    const response = {
      id: problem.problemId,
      title: problem.title,
      statement: problem.statement,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat,
      constraints: problem.constraints,
      samples: problem.samples,
      difficulty: problem.difficulty,
      tags: problem.tags
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching random problem:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findOne({ problemId: id })
      .select('-__v');

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    const response = {
      id: problem.problemId,
      title: problem.title,
      statement: problem.statement,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat,
      constraints: problem.constraints,
      samples: problem.samples,
      difficulty: problem.difficulty,
      tags: problem.tags
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};