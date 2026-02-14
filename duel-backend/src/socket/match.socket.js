import { Match } from "../models/match.model.js";

export const registerMatchHandlers = (io, socket) => {
  socket.currentMatchId = null;

  // JOIN MATCH
  socket.on("match:join", async ({ matchId }) => {
    console.log(
      `📨 match:join from ${socket.user.username} for ${matchId}`
    );

    const match = await Match.findById(matchId);
    if (!match) {
      return socket.emit("match:error", { message: "Match not found" });
    }

    const userId = socket.user._id.toString();
    const isParticipant =
      match.playerA.toString() === userId ||
      match.playerB.toString() === userId;

    if (!isParticipant) {
      return socket.emit("match:error", {
        message: "Not part of this match",
      });
    }

    const roomId = `match:${matchId}`;
    socket.join(roomId);
    socket.currentMatchId = matchId;

    // ✅ PHASE 3 — opponent connected
    socket.to(roomId).emit("opponent:connected", {
      userId: socket.user._id,
      username: socket.user.username,
    });

    console.log(
      `🎯 ${socket.user.username} joined match:${matchId}`
    );

    socket.emit("match:joined", { matchId });

    const roomSize =
      io.sockets.adapter.rooms.get(roomId)?.size || 1;

    if (roomSize === 2 && match.status !== "active") {
      match.status = "active";
      await match.save();

      console.log(`🚦 match ready: ${matchId}`);

      io.to(roomId).emit("match:ready", {
        matchId,
        startTime: Date.now(),
      });
    }
  });

  // SUBMIT MATCH (Phase 1)
  socket.on("match:submit", async ({ matchId, payload }) => {
    console.log(
      `📤 match:submit from ${socket.user.username} for ${matchId}`
    );

    const match = await Match.findById(matchId);
    if (!match || match.status !== "active") return;

    const winner =
      Math.random() > 0.5 ? match.playerA : match.playerB;

    match.status = "finished";
    match.winner = winner;
    match.endedAt = new Date();
    await match.save();

    console.log(`🏁 match ended: ${matchId}`);

    io.to(`match:${matchId}`).emit("match:ended", {
      matchId,
      winner,
      reason: "submission",
      payload,
    });
  });

  // DISCONNECT → FORFEIT + PRESENCE (Phase 2 + 3)
  socket.on("disconnect", async () => {
    const matchId = socket.currentMatchId;
    if (!matchId) return;

    // ✅ PHASE 3 — opponent disconnected
    socket.to(`match:${matchId}`).emit("opponent:disconnected", {
      userId: socket.user._id,
      username: socket.user.username,
    });

    const match = await Match.findById(matchId);
    if (!match || match.status !== "active") return;

    const userId = socket.user._id.toString();
    const opponent =
      match.playerA.toString() === userId
        ? match.playerB
        : match.playerA;

    match.status = "finished";
    match.winner = opponent;
    match.endedAt = new Date();
    await match.save();

    console.log(
      `🏳️ forfeit: ${socket.user.username} disconnected from ${matchId}`
    );

    io.to(`match:${matchId}`).emit("match:ended", {
      matchId,
      winner: opponent,
      reason: "forfeit",
    });
  });
};
