import 'dotenv/config';
import express from 'express';
import connectDB from './config/database.js';
import problemRoutes from './routes/problem.routes.js';
import testCaseRoutes from './routes/testCase.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

connectDB();

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Problem Service is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/problems', problemRoutes);
app.use('/internal', testCaseRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Problem Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;