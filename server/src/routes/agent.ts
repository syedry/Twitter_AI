import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AgentService } from '../services/AgentService';
import { TwitterService } from '../services/TwitterService';

const router = express.Router();
const prisma = new PrismaClient();
const agentService = new AgentService();
const twitterService = new TwitterService();

// Get all tweet logs
router.get('/logs', async (_req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.tweetLog.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        agent: true
      }
    });

    // Transform the data to include agent details
    const formattedLogs = logs.map(log => ({
      id: log.id,
      content: log.content,
      createdAt: log.createdAt,
      status: log.status,
      error: log.error,
      likes: log.likes,
      retweets: log.retweets,
      replies: log.replies,
      agentName: log.agent.name,
      twitterUsername: log.agent.twitterUsername
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to get tweet logs' });
  }
});

// Simulate tweets
router.get('/simulate', async (req: Request, res: Response): Promise<void> => {
  const { twitterHandle, personality, tweetsPerDay, character } = req.query;

  if (!twitterHandle) {
    res.status(400).json({ error: 'Twitter handle is required' });
    return;
  }

  try {
    // Send initial progress
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const sendProgress = (message: string, progress: number) => {
      res.write(`data: ${JSON.stringify({ message, progress })}\n\n`);
    };

    sendProgress('Starting tweet scraping...', 10);

    // Get or create scraped user and their tweets
    const scrapedUser = await twitterService.getOrCreateScrapedUser(twitterHandle as string);
    
    if (!scrapedUser) {
      throw new Error('Failed to create or find scraped user');
    }
    
    sendProgress('Processing tweets...', 30);

    // Create temporary agent for simulation
    const tempAgent = await prisma.agent.create({
      data: {
        name: `Temp_${twitterHandle}`,
        twitterHandle: twitterHandle as string,
        personality: personality as string || 'default',
        languageStyle: 'default',
        tweetsPerDay: typeof tweetsPerDay === 'string' ? parseInt(tweetsPerDay) : 1,
        character: character as string || 'default',
        styleProfile: {
          create: {
            writingPatterns: {},
            trainingTweetCount: 0
          }
        }
      },
      include: {
        styleProfile: true
      }
    });

    sendProgress('Training agent...', 50);

    // Verify tweets were stored
    const storedTweets = await prisma.tweet.findMany({
      where: { scrapedUserId: scrapedUser.id },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    if (!storedTweets.length) {
      throw new Error('No tweets were stored successfully. Please try again.');
    }

    console.log(`Found ${storedTweets.length} stored tweets for training`);

    // Train the agent on the user's tweets
    await agentService.updateAgentTraining(tempAgent.id);

    sendProgress('Generating sample tweets...', 80);

    // Generate tweets using the trained agent
    const generatedTweets = await agentService.generateTweets(tempAgent.id, 3);

    sendProgress('Finalizing...', 90);

    // Clean up temporary agent and its related data
    await prisma.$transaction([
      prisma.agentStyleProfile.deleteMany({
        where: { agentId: tempAgent.id }
      }),
      prisma.agent.delete({
        where: { id: tempAgent.id }
      })
    ]);

    // Send final result
    res.write(`data: ${JSON.stringify({ 
      status: 'complete',
      tweets: generatedTweets 
    })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Simulation error:', error);
    res.write(`data: ${JSON.stringify({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to simulate tweets'
    })}\n\n`);
    res.end();
  }
});

// Create agent
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const agent = await agentService.createAgent(req.body);
    res.json(agent);
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Get all agents
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        tweetLogs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });
    res.json(agents);
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Failed to get agents' });
  }
});

// Get single agent
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: {
        tweetLogs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });
    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    res.json(agent);
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Failed to get agent' });
  }
});

// Update agent (PUT)
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedAgent = await prisma.agent.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updatedAgent);
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// Update agent (PATCH)
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedAgent = await prisma.agent.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updatedAgent);
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// Delete agent
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    // Delete agent and related data in a transaction
    await prisma.$transaction([
      prisma.agentStyleProfile.deleteMany({
        where: { agentId: req.params.id }
      }),
      prisma.tweetLog.deleteMany({
        where: { agentId: req.params.id }
      }),
      prisma.agent.delete({
        where: { id: req.params.id }
      })
    ]);
    
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// Train agent
router.post('/:id/train', async (req: Request, res: Response): Promise<void> => {
  try {
    const agent = await agentService.updateAgentTraining(req.params.id);
    res.json(agent);
  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({ error: 'Failed to train agent' });
  }
});

export default router; 