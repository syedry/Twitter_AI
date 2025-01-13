import OpenAI from 'openai';
import type { GeneratedTweet } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface Tweet {
  content: string;
}

interface StyleAnalysis {
  writingStyle: string;
  commonPhrases: string[];
  punctuationStyle: string;
  capitalizationStyle: string;
  commonAcronyms: string[];
  emojiUsage: string;
  sentenceStructure: string;
  informality: {
    level: string;
    commonSlang: string[];
    profanityUsage: string;
  };
  formatting: {
    usesParagraphs: boolean;
    usesThreads: boolean;
    averageTweetLength: number;
  };
  vocabulary: {
    complexity: string;
    uniqueWords: string[];
    commonWords: string[];
  };
}

async function analyzeTweetStyle(twitterHandle: string): Promise<StyleAnalysis> {
  try {
    const response = await fetch(
      `https://api.scrapingdog.com/twitter/tweets?api_key=${
        import.meta.env.VITE_SCRAPINGDOG_API_KEY
      }&username=${twitterHandle}&count=100`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch tweets');
    }

    const tweets = await response.json() as { text: string }[];
    const tweetTexts = tweets.map(t => t.text);
    
    const analysis = await openai.chat.completions.create({
      model: 'ft:gpt-3.5-turbo-1106:hype3:version3:AovVeiFA',
      messages: [
        {
          role: 'system',
          content: `You are a highly detailed writing style analyst. Your task is to perform a deep analysis of tweet patterns, focusing on:

1. Writing mechanics:
- Exact capitalization patterns (consistent lowercase, ALL CAPS for emphasis, etc.)
- Punctuation habits (missing periods, multiple exclamation marks, etc.)
- Spacing patterns (extra spaces, no spaces after punctuation, etc.)

2. Language patterns:
- Specific acronyms and abbreviations they use
- Slang terms and informal language
- Profanity usage and style
- Common phrases or expressions
- Unique hashtag usage

3. Structural elements:
- How they start their tweets
- How they end their tweets
- Thread creation patterns
- Paragraph/line break usage
- Average tweet length

4. Vocabulary and tone:
- Complexity of language
- Emotional expression style
- Use of humor or sarcasm
- Professional vs. casual language
- Common words and phrases

5. Special elements:
- Emoji usage patterns
- URL/link placement
- Mention (@user) patterns
- Quote tweet styles

Analyze these patterns with extreme attention to detail. The goal is to create a comprehensive style guide that would allow perfect mimicry of the user's writing style.`,
        },
        {
          role: 'user',
          content: `Analyze these tweets and provide a detailed JSON object capturing all the above aspects. Be extremely specific about patterns:

Tweets to analyze: ${JSON.stringify(tweetTexts)}`,
        },
      ],
      temperature: 0.1,
    });

    const styleAnalysis = JSON.parse(analysis.choices[0].message.content || '{}');
    return styleAnalysis;
  } catch (error) {
    console.error('Error analyzing tweets:', error);
    return {
      writingStyle: 'casual',
      commonPhrases: [],
      punctuationStyle: 'standard',
      capitalizationStyle: 'standard',
      commonAcronyms: [],
      emojiUsage: 'minimal',
      sentenceStructure: 'standard',
      informality: {
        level: 'moderate',
        commonSlang: [],
        profanityUsage: 'none',
      },
      formatting: {
        usesParagraphs: false,
        usesThreads: false,
        averageTweetLength: 140,
      },
      vocabulary: {
        complexity: 'moderate',
        uniqueWords: [],
        commonWords: [],
      },
    };
  }
}

export async function generateTweets(
  twitterHandle: string,
  character: string,
  tweetPriorities: string,
  languageStyle: string,
  count: number = 3
): Promise<Tweet[]> {
  try {
    const styleAnalysis = await analyzeTweetStyle(twitterHandle);

    const response = await openai.chat.completions.create({
      model: 'ft:gpt-3.5-turbo-1106:hype3:version3:AovVeiFA',
      messages: [
        {
          role: 'system',
          content: `You are an expert at mimicking Twitter writing styles. You have a deep understanding of the following style analysis:

${JSON.stringify(styleAnalysis, null, 2)}

Your task is to generate tweets that PERFECTLY match this writing style while incorporating the following aspects:
1. Character profile: ${character}
2. Tweet priorities: ${tweetPriorities}
3. Language style: ${languageStyle}

Critical style rules to follow:
1. Match their exact capitalization patterns - if they use all lowercase, NEVER capitalize anything
2. Copy their punctuation style precisely - if they don't use periods, don't add them
3. Use their common acronyms and abbreviations
4. Match their level of informality and slang usage
5. Copy their emoji usage patterns exactly
6. Maintain their sentence structure and formatting
7. Use similar vocabulary complexity
8. Match their profanity usage level (if any)
9. Copy their hashtag and mention patterns
10. Maintain their average tweet length

The tweets should feel INDISTINGUISHABLE from the user's actual tweets while incorporating the new content/character/priorities.`,
        },
        {
          role: 'user',
          content: `Generate ${count} unique tweets that perfectly match the analyzed style. Return them as a JSON array of objects with a "content" property.`,
        },
      ],
      temperature: 0.4,
    });

    const tweets = JSON.parse(response.choices[0].message.content || '[]');
    return tweets;
  } catch (error) {
    console.error('Error generating tweets:', error);
    throw new Error('Failed to generate tweets. Please try again.');
  }
}

export type { Tweet, StyleAnalysis, GeneratedTweet };