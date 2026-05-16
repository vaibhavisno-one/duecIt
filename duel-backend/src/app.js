import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { createServer } from 'http'

const app = express()
const httpServer = createServer(app)

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [];

if (allowedOrigins.length === 0) {
  throw new Error("CORS_ORIGIN not defined");
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed`));
    }
  },
  credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// ROUTES
import userRouter from "./routes/user.routes.js";
app.use("/api/user", userRouter)

import matchRouter from "./routes/match.routes.js";
app.use("/api/match", matchRouter)

import submissionRouter from "./routes/submission.routes.js";
app.use("/api/submission", submissionRouter)

import { ApiError } from "./utils/ApiError.js";

app.use((req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  const response = {
    success: false,
    status: statusCode,
    message: message,
  };

  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

export { httpServer }
export default app