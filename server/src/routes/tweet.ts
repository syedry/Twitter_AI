import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApifyClient } from 'apify-client';

const router = Router();
const prisma = new PrismaClient();

interface ScrapeRequestBody {
  twitterHandle: string;
}

interface ApifyTweet {
  type: 'tweet';
  id: string;
  url: string;
  text: string;
  fullText: string;
  createdAt: string;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
  viewCount: number;
  bookmarkCount: number;
  author: {
    userName: string;
    id: string;
    name: string;
  };
}

// Scrape and store tweets
const scrapeTweets = async (req: Request, res: Response): Promise<void> => {
  const { twitterHandle } = req.body as ScrapeRequestBody;

  if (!twitterHandle) {
    res.status(400).json({ error: 'Twitter handle is required' });
    return;
  }

  try {
    const client = new ApifyClient({
      token: process.env.APIFY_API_KEY,
    });

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    // Check if we have existing tweets for this user
    const existingUser = await prisma.scrapedUser.findUnique({
      where: { twitterHandle }
    });

    if (existingUser?.lastScrapedAt) {
      // If user exists, start from last scrape date
      startDate = existingUser.lastScrapedAt;
    } else {
      // If new user, get tweets from past year
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Prepare Actor input
    const input = {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      includeSearchTerms: false,
      maxItems: 300,
      onlyImage: false,
      onlyQuote: false,
      onlyTwitterBlue: false,
      onlyVerifiedUsers: false,
      onlyVideo: false,
      sort: "Latest",
      twitterHandles: [twitterHandle]
    };

    // Run the Actor and wait for it to finish
    const run = await client.actor("apidojo/tweet-scraper").call(input);

    // Fetch results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    const tweets = items as unknown as ApifyTweet[];

    // Create or update ScrapedUser
    const scrapedUser = await prisma.scrapedUser.upsert({
      where: { twitterHandle },
      create: {
        twitterHandle,
        lastScrapedAt: endDate
      },
      update: {
        lastScrapedAt: endDate
      }
    });

    // Store tweets in database
    const storedTweets = await Promise.all(
      tweets.map(async (tweet) => {
        if (!tweet.id || !tweet.fullText || !tweet.createdAt) {
          console.error('Invalid tweet data:', tweet);
          return null;
        }

        try {
          return await prisma.tweet.upsert({
            where: { tweetId: tweet.id },
            create: {
              tweetId: tweet.id,
              content: tweet.fullText,
              createdAt: new Date(tweet.createdAt),
              likesCount: tweet.likeCount || 0,
              retweetsCount: tweet.retweetCount || 0,
              repliesCount: tweet.replyCount || 0,
              scrapedUserId: scrapedUser.id
            },
            update: {
              likesCount: tweet.likeCount || 0,
              retweetsCount: tweet.retweetCount || 0,
              repliesCount: tweet.replyCount || 0
            }
          });
        } catch (error) {
          console.error('Error storing tweet:', error);
          return null;
        }
      })
    );

    const validTweets = storedTweets.filter((tweet): tweet is NonNullable<typeof tweet> => tweet !== null);

    res.json({
      message: 'Tweets scraped and stored successfully',
      scrapedUser,
      tweets: validTweets
    });
  } catch (error) {
    console.error('Error scraping tweets:', error);
    res.status(500).json({ error: 'Failed to scrape and store tweets' });
  }
};

// Get stored tweets for a user
const getStoredTweets = async (req: Request, res: Response): Promise<void> => {
  const { twitterHandle } = req.params;
  
  try {
    const scrapedUser = await prisma.scrapedUser.findUnique({
      where: { twitterHandle },
      include: {
        tweets: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!scrapedUser) {
      res.status(404).json({ error: 'No tweets found for this user' });
      return;
    }

    res.json(scrapedUser);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    res.status(500).json({ error: 'Failed to fetch tweets' });
  }
};

router.post('/scrape', scrapeTweets);
router.get('/:twitterHandle', getStoredTweets);

export default router; 