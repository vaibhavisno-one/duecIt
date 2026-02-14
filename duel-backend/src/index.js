import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./db/index.js";
import { initSocket } from "./socket/index.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const httpServer = http.createServer(app);

    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB CONNECTION FAILED", err);
  });
