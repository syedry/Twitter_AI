export interface Agent {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  tone: string;
  interests: string[];
  tweetFrequency: 'hourly' | 'daily' | 'weekly';
  knowledgeSources: {
    twitterHandle: string;
    profileUrl: string;
  }[];
  lastTweet?: string;
  lastUpdated: string;
  status: 'active' | 'paused';
  tweetPriorities: string[];
  languageStyle: string;
  autoReply: boolean;
  engagementRules?: {
    autoFollow: boolean;
    replyFrequency: 'always' | 'selective' | 'never';
    targetAccounts: string[];
  };
  tweetsPerDay: number;
}

export interface Tweet {
  id: string;
  content: string;
  timestamp: string;
  agentId: string;
  type: 'auto' | 'manual';
  replyTo?: string;
  performance?: {
    likes: number;
    retweets: number;
    replies: number;
  };
}

export interface TweetLog {
  agentId: string;
  tweets: Tweet[];
  date: string;
  totalTweets: number;
  successRate: number;
}