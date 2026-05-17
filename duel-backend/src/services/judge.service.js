import axios from 'axios';

const PISTON_URL = 'https://emkc.org/api/v2/piston';

const LANGUAGE_MAP = {
  javascript: 'javascript',
  python: 'python',
  cpp: 'cpp',
  java: 'java',
  c: 'c'
};

export const executeCode = async (code, language, testCases) => {
  const pistonLang = LANGUAGE_MAP[language] || 'javascript';
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await runSingleTest(code, pistonLang, testCase);
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

const runSingleTest = async (code, language, testCase) => {
  try {
    const startTime = Date.now();
    
    const response = await axios.post(`${PISTON_URL}/execute`, {
      language: language,
      version: '*',
      files: [{
        content: code
      }],
      stdin: testCase.input,
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: -1,
      run_memory_limit: -1
    });

    const executionTime = Date.now() - startTime;

    const output = response.data.run.stdout || '';
    const error = response.data.run.stderr || response.data.compile?.stderr || '';
    
    const passed = output.trim() === testCase.expectedOutput.trim();
    
    return {
      passed,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: output.trim(),
      executionTime,
      memory: 0,
      error: error || null
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

const calculateScore = (passed, total, avgTime, maxMemory) => {
  const passRate = passed / total;
  
  const timeScore = Math.max(0, 100 - (avgTime / 10));
  const memoryScore = Math.max(0, 100 - (maxMemory / 1000));
  
  const finalScore = (passRate * 70) + (timeScore * 0.15) + (memoryScore * 0.15);
  
  return Math.round(Math.min(100, Math.max(0, finalScore)));
};

export const getTestCasesFromProblemService = async (problemId) => {
  try {
    const response = await axios.get(
      `${process.env.PROBLEM_SERVICE_URL}/internal/testcases/${problemId}`,
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