const K_FACTOR = 32;

export const calculateEloChange = (playerRating, opponentRating, didWin) => {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  
  const actualScore = didWin ? 1 : 0;
  
  const ratingChange = Math.round(K_FACTOR * (actualScore - expectedScore));
  
  return ratingChange;
};

export const updatePlayerRatings = async (User, winnerId, loserId) => {
  const winner = await User.findById(winnerId);
  const loser = await User.findById(loserId);

  if (!winner || !loser) {
    throw new Error('Players not found');
  }

  const winnerChange = calculateEloChange(winner.rating, loser.rating, true);
  const loserChange = calculateEloChange(loser.rating, winner.rating, false);

  winner.rating += winnerChange;
  loser.rating += loserChange;

  winner.matchesPlayed += 1;
  loser.matchesPlayed += 1;

  await winner.save();
  await loser.save();

  return {
    winner: {
      id: winner._id,
      username: winner.username,
      oldRating: winner.rating - winnerChange,
      newRating: winner.rating,
      change: winnerChange
    },
    loser: {
      id: loser._id,
      username: loser.username,
      oldRating: loser.rating - loserChange,
      newRating: loser.rating,
      change: loserChange
    }
  };
};