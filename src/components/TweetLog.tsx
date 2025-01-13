import { formatDistanceToNow } from 'date-fns';
import type { Tweet } from '../types';
import TweetPreview from './TweetPreview';

interface TweetLogProps {
  tweets: Tweet[];
  agent: {
    name: string;
    avatar: string;
  };
}

export default function TweetLog({ tweets, agent }: TweetLogProps) {
  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <div key={tweet.id} className="relative">
          <div className="absolute -left-2 top-6 h-full w-0.5 bg-gray-200" />
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(tweet.createdAt))} ago
            </span>
          </div>
          <TweetPreview content={tweet.content} agent={agent} />
        </div>
      ))}
    </div>
  );
}