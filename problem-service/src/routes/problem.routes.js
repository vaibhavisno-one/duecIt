import express from 'express';
import {getRandomProblem,getProblemById} from '../controllers/problem.controller.js';

const router = express.Router();

router.get('/random', getRandomProblem);
router.get('/:id', getProblemById);

export default router;