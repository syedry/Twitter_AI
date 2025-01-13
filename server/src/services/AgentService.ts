import { PrismaClient } from '@prisma/client';
import { AgentTrainingService } from './AgentTrainingService';
import { TwitterService } from './TwitterService';
import 'dotenv/config';

const prisma = new PrismaClient();
const trainingService = new AgentTrainingService();
const twitterService = new TwitterService();

interface CreateAgentData {
  name: string;
  twitterHandle: string;
  character: string;
  personality: string;
  languageStyle: string;
  tweetsPerDay?: number;
  generatedTweets?: string[];
}

export class AgentService {
  async createAgent(data: CreateAgentData) {
    const { generatedTweets, ...agentData } = data;

    // Create the agent first
    const agent = await prisma.agent.create({
      data: {
        ...agentData,
        styleProfile: {
          create: {
            writingPatterns: {},
            trainingTweetCount: 0,
          }
        }
      },
      include: {
        styleProfile: true
      }
    });

    // If we have generated tweets, create tweet logs for them
    if (generatedTweets && generatedTweets.length > 0) {
      await prisma.tweetLog.createMany({
        data: generatedTweets.map(tweet => ({
          content: tweet,
          status: 'pending',
          agentId: agent.id,
          createdAt: new Date()
        }))
      });
    }

    // Fetch and analyze initial tweets
    const tweets = await twitterService.getUserTweets(data.twitterHandle);
    await trainingService.trainOnNewTweets(agent.id, tweets.map(t => t.text));

    // Return the agent with all related data
    return prisma.agent.findUnique({
      where: { id: agent.id },
      include: {
        styleProfile: true,
        tweetLogs: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    });
  }

  async generateTweets(agentId: string, count: number = 3) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        styleProfile: true,
        tweetLogs: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Generate tweets using the training service
    return await trainingService.generateTweetBatch(agentId, count);
  }

  async updateAgentTraining(agentId: string) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        styleProfile: true
      }
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Fetch latest tweets and update training
    const scrapedUser = await prisma.scrapedUser.findUnique({
      where: { twitterHandle: agent.twitterHandle },
      include: {
        tweets: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 100
        }
      }
    });

    if (!scrapedUser || scrapedUser.tweets.length === 0) {
      throw new Error('No tweets found for training');
    }

    console.log(`Found ${scrapedUser.tweets.length} tweets for training`);
    await trainingService.trainOnNewTweets(agentId, scrapedUser.tweets.map(t => t.content));

    return agent;
  }
} 