import { Match } from '../models/match.model.js';
import { User } from '../models/user.model.js';
import { getRandomProblem } from './problem-service.js';
import { emitToUser, joinMatchRoom, emitToMatch } from './socket.service.js';

const queue = new Map();

const ELO_RANGE = 200;

export const joinQueue = async (userId, difficulty) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  if (queue.has(userId.toString())) {
    throw new Error('Already in queue');
  }

  const queueEntry = {
    userId: userId.toString(),
    username: user.username,
    rating: user.rating,
    difficulty,
    joinedAt: Date.now()
  };

  queue.set(userId.toString(), queueEntry);

  emitToUser(userId, 'queue:joined', {
    position: queue.size,
    difficulty
  });

  tryMatchmaking(difficulty);

  return queueEntry;
};

export const leaveQueue = (userId) => {
  const removed = queue.delete(userId.toString());
  
  if (removed) {
    emitToUser(userId, 'queue:left');
  }
  
  return removed;
};

export const getQueueStatus = (userId) => {
  const entry = queue.get(userId.toString());
  
  if (!entry) {
    return null;
  }

  const position = Array.from(queue.values())
    .filter(e => e.difficulty === entry.difficulty && e.joinedAt <= entry.joinedAt)
    .length;

  return {
    ...entry,
    position,
    waitTime: Date.now() - entry.joinedAt
  };
};

const tryMatchmaking = async (difficulty) => {
  const players = Array.from(queue.values())
    .filter(p => p.difficulty === difficulty)
    .sort((a, b) => a.joinedAt - b.joinedAt);

  if (players.length < 2) {
    return;
  }

  for (let i = 0; i < players.length - 1; i++) {
    const player1 = players[i];
    const player2 = findOpponent(player1, players.slice(i + 1));

    if (player2) {
      await createMatch(player1, player2, difficulty);
      return;
    }
  }
};

const findOpponent = (player, candidates) => {
  for (const candidate of candidates) {
    const ratingDiff = Math.abs(player.rating - candidate.rating);
    
    if (ratingDiff <= ELO_RANGE) {
      return candidate;
    }
  }

  if (candidates.length > 0) {
    return candidates[0];
  }

  return null;
};

const createMatch = async (player1, player2, difficulty) => {
  try {
    const problem = await getRandomProblem(difficulty);

    if (!problem) {
      throw new Error('Failed to fetch problem');
    }

    const match = await Match.create({
      playerA: player1.userId,
      playerB: player2.userId,
      problemId: problem.id,
      difficulty,
      status: 'active',
      startTime: Date.now(),
      problemReadTime: 120,
      codingTime: 1800
    });

    queue.delete(player1.userId);
    queue.delete(player2.userId);

    joinMatchRoom(player1.userId, match._id.toString());
    joinMatchRoom(player2.userId, match._id.toString());

    const matchData = {
      matchId: match._id,
      problem: {
        id: problem.id,
        title: problem.title,
        statement: problem.statement,
        inputFormat: problem.inputFormat,
        outputFormat: problem.outputFormat,
        constraints: problem.constraints,
        samples: problem.samples,
        difficulty: problem.difficulty,
        tags: problem.tags
      },
      opponent: {
        playerA: {
          username: player1.username,
          rating: player1.rating
        },
        playerB: {
          username: player2.username,
          rating: player2.rating
        }
      },
      timers: {
        problemReadTime: 120,
        codingTime: 1800
      },
      startTime: match.startTime
    };

    emitToUser(player1.userId, 'match:found', {
      ...matchData,
      yourRole: 'playerA',
      opponent: matchData.opponent.playerB
    });

    emitToUser(player2.userId, 'match:found', {
      ...matchData,
      yourRole: 'playerB',
      opponent: matchData.opponent.playerA
    });

    setTimeout(() => {
      emitToMatch(match._id.toString(), 'match:reading_phase_end');
    }, 120000);

    console.log(`🎮 Match created: ${player1.username} vs ${player2.username}`);

    return match;
  } catch (error) {
    queue.set(player1.userId, player1);
    queue.set(player2.userId, player2);
    
    console.error('Match creation failed:', error);
    throw error;
  }
};

export const getQueueSize = () => queue.size;