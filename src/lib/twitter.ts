import { z } from 'zod';

const twitterResponseSchema = z.array(z.object({
  views: z.string(),
  retweets: z.string(),
  quotes: z.string(),
  likes: z.string(),
  bookmarks: z.string(),
  tweet: z.string(),
  profile_picture: z.string(),
  name: z.string(),
  profile_handle: z.string(),
  profile_url: z.string(),
  tweet_timing: z.string(),
  tweet_date: z.string(),
  tweet_id: z.string(),
  tweet_url: z.string()
}));

export type TwitterData = z.infer<typeof twitterResponseSchema>[0];

const SCRAPINGDOG_API_KEY = import.meta.env.VITE_SCRAPINGDOG_API_KEY;
const SCRAPINGDOG_API_URL = 'https://api.scrapingdog.com/twitter';

export class TwitterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TwitterError';
  }
}

export async function fetchTweetData(tweetUrl: string): Promise<TwitterData> {
  if (!SCRAPINGDOG_API_KEY) {
    throw new TwitterError('ScrapingDog API key is not configured');
  }

  try {
    const params = new URLSearchParams({
      api_key: SCRAPINGDOG_API_KEY,
      url: tweetUrl,
      parsed: 'true'
    });

    const response = await fetch(`${SCRAPINGDOG_API_URL}?${params}`);
    
    if (!response.ok) {
      throw new TwitterError(`Failed to fetch tweet data: ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = twitterResponseSchema.parse(data);
    
    if (parsed.length === 0) {
      throw new TwitterError('No tweet data found');
    }

    return parsed[0];
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new TwitterError('Invalid tweet data format received');
    }
    if (error instanceof TwitterError) {
      throw error;
    }
    throw new TwitterError('Failed to fetch tweet data');
  }
}

export function extractTweetIdFromUrl(url: string): string | null {
  try {
    const tweetUrl = new URL(url);
    const pathParts = tweetUrl.pathname.split('/');
    const statusIndex = pathParts.indexOf('status');
    
    if (statusIndex !== -1 && pathParts[statusIndex + 1]) {
      return pathParts[statusIndex + 1];
    }
    
    return null;
  } catch {
    return null;
  }
}

export function isTweetUrl(url: string): boolean {
  try {
    const tweetUrl = new URL(url);
    return (
      tweetUrl.hostname === 'twitter.com' || 
      tweetUrl.hostname === 'www.twitter.com' ||
      tweetUrl.hostname === 'x.com' ||
      tweetUrl.hostname === 'www.x.com'
    ) && tweetUrl.pathname.includes('/status/');
  } catch {
    return false;
  }
}
