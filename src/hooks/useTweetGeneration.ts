import { useState } from 'react';
import { generateTweets, GeneratedTweet } from '../lib/openai';

interface UseTweetGenerationProps {
  onError?: (error: Error) => void;
}

export function useTweetGeneration({ onError }: UseTweetGenerationProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [tweets, setTweets] = useState<GeneratedTweet[]>([]);

  const generateSampleTweets = async (
    twitterHandle: string,
    character: string,
    priorities: string,
    language: string
  ) => {
    setIsLoading(true);
    try {
      const generatedTweets = await generateTweets(
        twitterHandle,
        character,
        priorities,
        language
      );
      setTweets(generatedTweets);
    } catch (error) {
      console.error('Error in tweet generation:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to generate tweets'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    tweets,
    generateSampleTweets,
  };
}