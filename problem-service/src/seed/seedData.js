import 'dotenv/config';
import mongoose from 'mongoose';
import Problem from '../models/problem.model.js';
import TestCase from '../models/testCase.model.js';

const problems = [
  {
    problemId: 'P001',
    title: 'Two Sum',
    statement: 'Given an array of integers and a target value, return the indices of two numbers that add up to the target.',
    inputFormat: 'n\\na1 a2 a3 ... an\\ntarget',
    outputFormat: 'i j',
    constraints: '2 ≤ n ≤ 100000\\n-10^9 ≤ ai ≤ 10^9\\n-10^9 ≤ target ≤ 10^9',
    samples: [
      {
        input: '4\\n2 7 11 15\\n9',
        output: '0 1'
      }
    ],
    difficulty: 'easy',
    tags: ['array', 'hash-table', 'two-pointers']
  },
  {
    problemId: 'P002',
    title: 'Reverse String',
    statement: 'Given a string, reverse it.',
    inputFormat: 'string',
    outputFormat: 'reversed string',
    constraints: '1 ≤ length ≤ 100000\\nString contains only printable ASCII characters',
    samples: [
      {
        input: 'hello',
        output: 'olleh'
      }
    ],
    difficulty: 'easy',
    tags: ['string', 'two-pointers']
  }
];

const testCases = [
  // Two Sum - Small
  {
    problemId: 'P001',
    input: '5\\n1 2 3 4 5\\n9',
    expectedOutput: '3 4',
    sizeBucket: 'small',
    weight: 10,
    isHidden: true
  },
  {
    problemId: 'P001',
    input: '3\\n-1 0 1\\n0',
    expectedOutput: '0 2',
    sizeBucket: 'small',
    weight: 10,
    isHidden: true
  },

  // Two Sum - Medium
  {
    problemId: 'P001',
    input: generateTwoSumInput(1000),
    expectedOutput: '500 999',
    sizeBucket: 'medium',
    weight: 40,
    isHidden: true
  },

  // Two Sum - Large
  {
    problemId: 'P001',
    input: generateTwoSumInput(100000),
    expectedOutput: '50000 99999',
    sizeBucket: 'large',
    weight: 40,
    isHidden: true
  },

  // Reverse String - Small
  {
    problemId: 'P002',
    input: 'world',
    expectedOutput: 'dlrow',
    sizeBucket: 'small',
    weight: 10,
    isHidden: true
  },
  {
    problemId: 'P002',
    input: 'a',
    expectedOutput: 'a',
    sizeBucket: 'small',
    weight: 10,
    isHidden: true
  },

  // Reverse String - Medium
  {
    problemId: 'P002',
    input: 'a'.repeat(1000),
    expectedOutput: 'a'.repeat(1000),
    sizeBucket: 'medium',
    weight: 40,
    isHidden: true
  },

  // Reverse String - Large
  {
    problemId: 'P002',
    input: generateLargeString(100000),
    expectedOutput: generateLargeString(100000).split('').reverse().join(''),
    sizeBucket: 'large',
    weight: 40,
    isHidden: true
  }
];

function generateTwoSumInput(n) {
  const arr = Array.from({ length: n }, (_, i) => i + 1);
  const target = arr[Math.floor(n / 2)] + arr[n - 1];
  return `${n}\\n${arr.join(' ')}\\n${target}`;
}

function generateLargeString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Problem.deleteMany({});
    console.log('🗑️  Cleared existing problems');

    await TestCase.deleteMany({});
    console.log('🗑️  Cleared existing test cases');

    await Problem.insertMany(problems);
    console.log(`✅ Inserted ${problems.length} problems`);

    await TestCase.insertMany(testCases);
    console.log(`✅ Inserted ${testCases.length} test cases`);

    console.log('\\n🎉 Database seeding completed successfully!');
    console.log('\\nSeeded Problems:');
    problems.forEach(p => {
      console.log(`  - ${p.problemId}: ${p.title} (${p.difficulty})`);
    });

    await mongoose.connection.close();
    console.log('\\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();