import express from 'express';
import {getTestCases} from '../controllers/testCase.controller.js';
import serviceAuth from '../middleware/serviceAuth.js';

const router = express.Router();

router.post('/testcases/:problemId', serviceAuth, getTestCases);

export default router;