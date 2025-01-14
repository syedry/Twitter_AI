import { PrismaClient } from '@prisma/client';
import { AgentService } from './AgentService.js';
import 'dotenv/config';

// Configure Prisma client with connection pooling
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  datasourceUrl: process.env.DATABASE_URL,
});

export class TweetSchedulerService {
  private prisma: PrismaClient;
  private agentService: AgentService;
  private checkInterval: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.prisma = prisma;
    this.agentService = new AgentService();
  }

  async start(): Promise<void> {
    console.log('Starting tweet scheduler service...');
    
    // Test database connection with retries
    let retries = 5;
    while (retries > 0 && !this.isConnected) {
      try {
        await this.prisma.$connect();
        this.isConnected = true;
        console.log('Successfully connected to database');
      } catch (error) {
        console.error(`Failed to connect to database (${retries} retries left):`, error);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
        } else {
          throw new Error('Failed to connect to database after multiple attempts');
        }
      }
    }

    // Start the scheduler
    this.checkInterval = setInterval(() => {
      this.checkAndPostTweets().catch(error => {
        console.error('Error in tweet scheduler:', error);
      });
    }, 60000); // Check every minute
  }

  async stop(): Promise<void> {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    if (this.isConnected) {
      try {
        await this.prisma.$disconnect();
        this.isConnected = false;
        console.log('Successfully disconnected from database');
      } catch (error) {
        console.error('Error disconnecting from database:', error);
      }
    }
  }

  private async checkAndPostTweets(): Promise<void> {
    if (!this.isConnected) {
      console.log('Database not connected, attempting to reconnect...');
      try {
        await this.prisma.$connect();
        this.isConnected = true;
      } catch (error) {
        console.error('Failed to reconnect to database:', error);
        return;
      }
    }

    try {
      // Get all active agents with their style profiles
      const activeAgents = await this.prisma.agent.findMany({
        where: {
          isActive: true,
        },
        include: {
          styleProfile: true,
          tweetLogs: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      });

      const now = new Date();

      for (const agent of activeAgents) {
        try {
          // Check if it's time to post
          if (!this.shouldPostTweet(agent, now)) {
            continue;
          }

          // Generate and post tweet
          const tweets = await this.agentService.generateTweets(agent.id, 1);
          if (tweets && tweets.length > 0) {
            await this.prisma.tweetLog.create({
              data: {
                content: tweets[0],
                status: 'success',
                agentId: agent.id,
              },
            });
          }
        } catch (error) {
          console.error(`Error processing agent ${agent.id}:`, error);
          // Log the error but continue with other agents
          await this.prisma.tweetLog.create({
            data: {
              content: '',
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
              agentId: agent.id,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error in tweet scheduler:', error);
      this.isConnected = false; // Mark as disconnected to trigger reconnect
      // If database is down, wait longer before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
      throw error;
    }
  }

  private shouldPostTweet(agent: any, now: Date): boolean {
    // Get agent's timezone-adjusted hour
    const agentTime = new Date(now.toLocaleString('en-US', { timeZone: agent.timezone }));
    const currentHour = agentTime.getHours();

    // Check if current hour is within posting hours
    if (!agent.post24Hours && (currentHour < agent.postingStartHour || currentHour > agent.postingEndHour)) {
      return false;
    }

    // Check last tweet time
    const lastTweet = agent.tweetLogs[0];
    if (lastTweet) {
      const hoursSinceLastTweet = (now.getTime() - new Date(lastTweet.createdAt).getTime()) / (1000 * 60 * 60);
      const hoursPerTweet = 24 / agent.tweetsPerDay;
      return hoursSinceLastTweet >= hoursPerTweet;
    }

    return true;
  }
} 