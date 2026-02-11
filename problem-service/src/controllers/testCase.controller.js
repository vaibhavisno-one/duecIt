import TestCase from '../models/testCase.model.js';
import Problem from '../models/problem.model.js';

export const getTestCases = async (req, res) => {
  try {
    const { problemId } = req.params;

    const problem = await Problem.findOne({ problemId });
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    const testCases = await TestCase.find({ problemId })
      .select('-__v')
      .sort({ sizeBucket: 1, weight: 1 });

    res.json({
      success: true,
      data: {
        problemId,
        totalTestCases: testCases.length,
        testCases: testCases.map(tc => ({
          id: tc._id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          sizeBucket: tc.sizeBucket,
          weight: tc.weight,
          isHidden: tc.isHidden
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching test cases:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};