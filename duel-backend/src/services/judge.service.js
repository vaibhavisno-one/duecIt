import axios from 'axios';

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_API_KEY;

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
  c: 50
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const executeCode = async (code, language, testCases) => {
  const languageId = LANGUAGE_IDS[language] || 63;
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await runSingleTest(code, languageId, testCase);
    results.push(result);
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / totalCount;
  const maxMemory = Math.max(...results.map(r => r.memory));

  const finalScore = calculateScore(passedCount, totalCount, avgExecutionTime, maxMemory);

  return {
    passedCount,
    totalCount,
    executionTime: Math.round(avgExecutionTime),
    memory: maxMemory,
    finalScore,
    testResults: results
  };
};

const runSingleTest = async (code, languageId, testCase) => {
  try {
    const submission = await createSubmission(code, languageId, testCase.input);
    
    const token = submission.token;
    
    let result = await getSubmissionResult(token);
    
    let attempts = 0;
    while (result.status.id <= 2 && attempts < 10) {
      await sleep(500);
      result = await getSubmissionResult(token);
      attempts++;
    }

    const passed = result.stdout?.trim() === testCase.expectedOutput.trim();
    
    return {
      passed,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: result.stdout?.trim() || '',
      executionTime: parseFloat(result.time || 0) * 1000,
      memory: parseInt(result.memory || 0),
      statusId: result.status.id,
      error: result.stderr || result.compile_output || null
    };
  } catch (error) {
    console.error('Test execution error:', error);
    return {
      passed: false,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: '',
      executionTime: 0,
      memory: 0,
      error: error.message
    };
  }
};

const createSubmission = async (code, languageId, input) => {
  const options = {
    method: 'POST',
    url: `${JUDGE0_URL}/submissions`,
    params: { base64_encoded: 'false', wait: 'false' },
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    },
    data: {
      language_id: languageId,
      source_code: code,
      stdin: input,
      cpu_time_limit: 2,
      memory_limit: 128000
    }
  };

  const response = await axios.request(options);
  return response.data;
};

const getSubmissionResult = async (token) => {
  const options = {
    method: 'GET',
    url: `${JUDGE0_URL}/submissions/${token}`,
    params: { base64_encoded: 'false' },
    headers: {
      'X-RapidAPI-Key': JUDGE0_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    }
  };

  const response = await axios.request(options);
  return response.data;
};

const calculateScore = (passed, total, avgTime, maxMemory) => {
  const passRate = passed / total;
  
  const timeScore = Math.max(0, 100 - (avgTime / 10));
  const memoryScore = Math.max(0, 100 - (maxMemory / 1000));
  
  const finalScore = (passRate * 70) + (timeScore * 0.15) + (memoryScore * 0.15);
  
  return Math.round(Math.min(100, Math.max(0, finalScore)));
};

export const getTestCasesFromProblemService = async (problemId) => {
  try {
    const response = await axios.post(
      `${process.env.PROBLEM_SERVICE_URL}/internal/testcases/${problemId}`,
      {},
      {
        headers: {
          'x-service-key': process.env.PROBLEM_SERVICE_KEY
        }
      }
    );

    return response.data.data.testCases;
  } catch (error) {
    console.error('Failed to fetch test cases:', error);
    throw new Error('Unable to fetch test cases');
  }
};