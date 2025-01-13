export interface Agent {
  id: string;
  name: string;
  twitterHandle: string;
  personality: string;
  languageStyle: string;
  tweetsPerDay: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profilePicture?: string;
  tweetPriorities?: string;
}

export interface Tweet {
  id: string;
  content: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedTweet {
  content: string;
  sentiment?: string;
  topic?: string;
  writingStyle?: string;
  engagement?: {
    likes?: number;
    retweets?: number;
    replies?: number;
  };
} 