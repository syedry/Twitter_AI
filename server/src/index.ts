import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import agentRoutes from './routes/agent';
import authRoutes from './routes/auth';
import tweetRoutes from './routes/tweet';
import { TweetSchedulerService } from './services/TweetSchedulerService';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Initialize scheduler
const scheduler = new TweetSchedulerService();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/agents', agentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tweets', tweetRoutes);

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    // Test database connection before starting server
    await prisma.$connect();
    console.log('Successfully connected to database');

    // Start the scheduler
    await scheduler.start();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle cleanup on shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await scheduler.stop();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await scheduler.stop();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
