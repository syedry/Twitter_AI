import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TwitterApi } from 'twitter-api-v2';

const router = Router();
const prisma = new PrismaClient();

// Initialize Twitter client
const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID || '',
  clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
});

// Initiate Twitter OAuth connection
const connectTwitter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { agentId } = req.params;

    // Generate OAuth URL with state parameter containing agentId
    const { url, codeVerifier } = twitterClient.generateOAuth2AuthLink(
      process.env.TWITTER_CALLBACK_URL || 'http://localhost:3001/api/auth/twitter/callback',
      { 
        scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
        state: agentId // Pass agentId as state
      }
    );

    // Store code verifier in session or database
    // For now, we'll store it in memory (you should use a proper session store)
    (req.app.locals as any).codeVerifier = codeVerifier;

    res.json({ authUrl: url });
  } catch (error) {
    console.error('Twitter connect error:', error);
    res.status(500).json({ error: 'Failed to initiate Twitter connection' });
  }
};

// Handle Twitter OAuth callback
const twitterCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state } = req.query;
    const agentId = state as string;
    const codeVerifier = (req.app.locals as any).codeVerifier;

    if (!code || !state || !codeVerifier) {
      throw new Error('Missing required OAuth parameters');
    }

    // Exchange code for access token
    const { accessToken, refreshToken } = await twitterClient.loginWithOAuth2({
      code: code as string,
      codeVerifier,
      redirectUri: process.env.TWITTER_CALLBACK_URL || 'http://localhost:3001/api/auth/twitter/callback',
    });

    // Get user info
    const twitterUser = await new TwitterApi(accessToken).v2.me();

    // Update agent with Twitter credentials
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        twitterAccessToken: accessToken,
        twitterRefreshToken: refreshToken,
        twitterUsername: twitterUser.data.username,
        isActive: true
      }
    });

    // Redirect back to frontend with success parameter
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/connect-twitter?success=true`);
  } catch (error) {
    console.error('Twitter callback error:', error);
    const errorMessage = encodeURIComponent('Failed to connect Twitter account');
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/connect-twitter?error=${errorMessage}`);
  }
};

// Disconnect Twitter account
const disconnectTwitter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { agentId } = req.params;

    await prisma.agent.update({
      where: { id: agentId },
      data: {
        twitterAccessToken: null,
        twitterRefreshToken: null,
        twitterUsername: null,
        isActive: false
      }
    });

    res.json({ message: 'Twitter account disconnected successfully' });
  } catch (error) {
    console.error('Twitter disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect Twitter account' });
  }
};

router.post('/twitter/connect/:agentId', connectTwitter);
router.get('/twitter/callback', twitterCallback);
router.post('/twitter/disconnect/:agentId', disconnectTwitter);

export default router; 