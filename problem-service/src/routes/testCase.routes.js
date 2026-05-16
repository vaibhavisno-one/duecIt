import express from 'express';
import {getTestCases} from '../controllers/testCase.controller.js';
import serviceAuth from '../middleware/serviceAuth.js';

const router = express.Router();

router.get('/testcases/:problemId', serviceAuth, getTestCases);

export default router;