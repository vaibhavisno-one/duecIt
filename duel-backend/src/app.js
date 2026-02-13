// setting up express

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

// Parse CORS_ORIGIN to support multiple origins (comma-separated)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [];

if (allowedOrigins.length === 0) {
  throw new Error("CORS_ORIGIN is not defined");
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}))


app.use(express.json({ limit: "16kb" }))

app.use(express.urlencoded({ extended: true, limit: "16kb" }))

app.use(express.static("public"))

app.use(cookieParser())



//ROUTES----------------------------

//USER ROUTES
import userRouter from "./routes/user.routes.js";

app.use("/api/user", userRouter)

//MATCH ROUTES
import matchRouter from "./routes/match.routes.js";

app.use("/api/match", matchRouter)

//SUBMISSION ROUTES
import submissionRouter from "./routes/submission.routes.js";

app.use("/api/submission", submissionRouter)







// Import ApiError for error handling
import { ApiError } from "./utils/ApiError.js";

// 404 Handler - Must come after all routes
app.use((req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
});

// Centralized Error Handler - Must be last middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Never send stack traces in production
  const response = {
    success: false,
    status: statusCode,
    message: message,
  };

  // Include errors array if present (for validation errors)
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  // Log error details server-side
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
    response.stack = err.stack;
  }

  // Always return JSON, never HTML
  res.status(statusCode).json(response);
});


export default app;