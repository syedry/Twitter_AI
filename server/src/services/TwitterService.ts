import { PrismaClient } from '@prisma/client';
import { ApifyClient } from 'apify-client';
import 'dotenv/config';

const prisma = new PrismaClient();

interface ApifyTweet {
  id: string;
  text?: string;
  fullText?: string;
  createdAt: string;
  likeCount: number | string;
  retweetCount: number | string;
  replyCount: number | string;
}

interface Tweet {
  text: string;
  id: string;
  created_at: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

function isApifyTweet(item: unknown): item is ApifyTweet {
  const tweet = item as Record<string, unknown>;
  return (
    typeof tweet === 'object' &&
    tweet !== null &&
    typeof tweet.id === 'string' &&
    typeof tweet.createdAt === 'string' &&
    (typeof tweet.text === 'string' || typeof tweet.fullText === 'string') &&
    (typeof tweet.likeCount === 'string' || typeof tweet.likeCount === 'number' || tweet.likeCount === undefined) &&
    (typeof tweet.retweetCount === 'string' || typeof tweet.retweetCount === 'number' || tweet.retweetCount === undefined) &&
    (typeof tweet.replyCount === 'string' || typeof tweet.replyCount === 'number' || tweet.replyCount === undefined)
  );
}

export class TwitterService {
  private async scrapeTweets(twitterHandle: string): Promise<void> {
    const client = new ApifyClient({
      token: process.env.APIFY_API_KEY,
    });

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();

    // Check if we have existing tweets for this user
    const existingUser = await prisma.scrapedUser.findUnique({
      where: { twitterHandle },
      include: {
        tweets: true
      }
    });

    if (existingUser && existingUser.tweets.length > 0) {
      // For existing users, start from last scrape date
      startDate = existingUser.lastScrapedAt;
      console.log(`Found ${existingUser.tweets.length} existing tweets, updating from ${startDate.toISOString()}`);
    } else {
      // For first time scrape, get 1 year of tweets
      startDate.setFullYear(startDate.getFullYear() - 1);
      console.log(`First time scrape, fetching tweets from past year`);
    }

    // Format dates as YYYY-MM-DD
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    // Prepare Actor input exactly as per documentation
    const input = {
      start: formattedStartDate,
      end: formattedEndDate,
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

    console.log('Starting Apify scraper with input:', input);

    try {
      // Run the Actor and wait for it to finish
      const run = await client.actor("apidojo/tweet-scraper").call(input);

      // Fetch results exactly as per documentation
      console.log('Results from dataset');
      console.log(`Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      
      // Process the tweets
      const tweets = (items as unknown[]).filter(isApifyTweet);
      console.log(`Received ${tweets.length} valid tweets from Apify`);

      if (tweets.length === 0) {
        if (!existingUser || existingUser.tweets.length === 0) {
          // For new users with no tweets, try a longer time range
          console.log('No tweets found in the past year, trying with a longer time range...');
          const retryStartDate = new Date();
          retryStartDate.setFullYear(retryStartDate.getFullYear() - 2);
          
          const retryInput = {
            ...input,
            start: retryStartDate.toISOString().split('T')[0],
            maxItems: 300 // Keep the same limit as per documentation
          };

          console.log('Retrying Apify scraper with input:', retryInput);
          const retryRun = await client.actor("apidojo/tweet-scraper").call(retryInput);
          console.log(`Check retry data here: https://console.apify.com/storage/datasets/${retryRun.defaultDatasetId}`);
          const retryData = await client.dataset(retryRun.defaultDatasetId).listItems();
          const retryTweets = (retryData.items as unknown[]).filter(isApifyTweet);
          console.log(`Received ${retryTweets.length} valid tweets from retry attempt`);

          if (retryTweets.length === 0) {
            throw new Error(`Could not find any tweets for @${twitterHandle}. Please verify that this is a valid and active Twitter/X account.`);
          }

          // Process the retry tweets
          await this.processTweets(retryTweets, twitterHandle, endDate);
          return;
        }
        console.log('No new tweets found since last scrape');
        return;
      }

      // Process the tweets
      await this.processTweets(tweets, twitterHandle, endDate);

    } catch (error) {
      console.error('Error in scrapeTweets:', error);
      throw error;
    }
  }

  private async processTweets(tweets: ApifyTweet[], twitterHandle: string, endDate: Date) {
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
    let successCount = 0;
    for (const tweet of tweets) {
      try {
        const tweetDate = new Date(tweet.createdAt);
        if (isNaN(tweetDate.getTime())) {
          console.warn('Invalid tweet date:', tweet.createdAt);
          continue;
        }

        const content = tweet.fullText || tweet.text || '';
        const likesCount = typeof tweet.likeCount === 'string' ? parseInt(tweet.likeCount) : (typeof tweet.likeCount === 'number' ? tweet.likeCount : 0);
        const retweetsCount = typeof tweet.retweetCount === 'string' ? parseInt(tweet.retweetCount) : (typeof tweet.retweetCount === 'number' ? tweet.retweetCount : 0);
        const repliesCount = typeof tweet.replyCount === 'string' ? parseInt(tweet.replyCount) : (typeof tweet.replyCount === 'number' ? tweet.replyCount : 0);

        await prisma.tweet.upsert({
          where: { tweetId: tweet.id.toString() },
          create: {
            tweetId: tweet.id.toString(),
            content,
            createdAt: tweetDate,
            likesCount,
            retweetsCount,
            repliesCount,
            scrapedUserId: scrapedUser.id
          },
          update: {
            content,
            likesCount,
            retweetsCount,
            repliesCount,
          }
        });
        successCount++;
      } catch (error) {
        console.error('Error storing tweet:', error);
        continue;
      }
    }

    console.log(`Successfully stored ${successCount} new tweets`);
    if (successCount === 0) {
      throw new Error(`Failed to store any tweets for @${twitterHandle}`);
    }
  }

  async getUserTweets(twitterHandle: string): Promise<Tweet[]> {
    try {
      // First check if we have tweets in our database
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

      if (!scrapedUser || scrapedUser.tweets.length === 0) {
        // If no tweets found, scrape them
        console.log('No tweets found, scraping new tweets...');
        await this.scrapeTweets(twitterHandle);
        
        // Fetch the newly scraped tweets
        const updatedUser = await prisma.scrapedUser.findUnique({
          where: { twitterHandle },
          include: {
            tweets: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        });

        if (!updatedUser || updatedUser.tweets.length === 0) {
          throw new Error('Failed to scrape tweets');
        }

        // Convert database tweets to Tweet interface format
        return updatedUser.tweets.map(tweet => ({
          text: tweet.content,
          id: tweet.tweetId,
          created_at: tweet.createdAt.toISOString(),
          public_metrics: {
            like_count: tweet.likesCount,
            retweet_count: tweet.retweetsCount,
            reply_count: tweet.repliesCount
          }
        }));
      }

      // Convert database tweets to Tweet interface format
      return scrapedUser.tweets.map(tweet => ({
        text: tweet.content,
        id: tweet.tweetId,
        created_at: tweet.createdAt.toISOString(),
        public_metrics: {
          like_count: tweet.likesCount,
          retweet_count: tweet.retweetsCount,
          reply_count: tweet.repliesCount
        }
      }));
    } catch (error) {
      console.error('Error fetching user tweets:', error);
      throw error;
    }
  }

  async getOrCreateScrapedUser(twitterHandle: string) {
    try {
      // First check if user exists with their tweets
      let scrapedUser = await prisma.scrapedUser.findUnique({
        where: { twitterHandle },
        include: {
          tweets: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      // If user exists and has tweets, try to get new tweets but don't fail if none found
      if (scrapedUser && scrapedUser.tweets.length > 0) {
        console.log(`Found ${scrapedUser.tweets.length} existing tweets for user ${twitterHandle}`);
        try {
          await this.scrapeTweets(twitterHandle);
        } catch (error) {
          console.log('Failed to get new tweets, continuing with existing tweets');
        }
        
        // Refresh user data
        const updatedUser = await prisma.scrapedUser.findUnique({
          where: { twitterHandle },
          include: {
            tweets: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        });
        
        if (updatedUser && updatedUser.tweets.length > 0) {
          return updatedUser;
        }
        return scrapedUser;
      }

      // If user doesn't exist or has no tweets, try to scrape new tweets
      console.log(`No existing tweets found for user ${twitterHandle}, attempting to scrape...`);
      await this.scrapeTweets(twitterHandle);
      
      // Fetch the user with newly scraped tweets
      const newUser = await prisma.scrapedUser.findUnique({
        where: { twitterHandle },
        include: {
          tweets: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!newUser || newUser.tweets.length === 0) {
        throw new Error(`No tweets found for user ${twitterHandle}`);
      }

      return newUser;
    } catch (error) {
      console.error('Error in getOrCreateScrapedUser:', error);
      throw error;
    }
  }
} 