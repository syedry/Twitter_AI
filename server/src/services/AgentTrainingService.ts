import { PrismaClient, Prisma } from '@prisma/client';
import OpenAI from 'openai';
import 'dotenv/config';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface WritingPatterns {
  casing: {
    usesCapitalization: boolean;
    capitalizedWords: string[];
    allCapsWords: string[];
  };
  punctuation: {
    endingSentenceStyle: string;
    commonPunctuationPatterns: string[];
    usesPeriods: boolean;
    usesExclamationMarks: boolean;
    multipleExclamationMarks: boolean;
    usesQuestionMarks: boolean;
    usesEllipsis: boolean;
    spacingStyle: string;
    multipleMarks: boolean;
    gapBetweenSentences: string;
  };
  vocabulary: {
    commonWords: string[];
    uniquePhrases: string[];
    acronyms: string[];
    slangTerms: string[];
    profanity: string[];
    hashtagStyle: string[];
    commonPhrases: string[]
    mentionStyle: string[];
    emojiUsage: {
      usesEmojis: boolean,
      mostUsedEmojis: string[],
      emojiFrequency: number
    }
    technicalTerms: string[];
  };
  content: {
    mainTopics: string[];
    frequentReferences: {
      people: string[];
      companies: string[];
      products: string[];
    };
    contentStyle: {
      usesThreads: boolean;
      includesLinks: boolean;
      usesMemes: boolean;
      quoteTweets: boolean;
    };
  };
}

interface StyleProfile {
  id: string;
  agentId: string;
  writingPatterns: WritingPatterns;
  lastUpdated: Date;
  trainingTweetCount: number;
}

const defaultWritingPatterns: WritingPatterns = {
  casing: {
    usesCapitalization: true,
    capitalizedWords: [],
    allCapsWords: [],
  },
  punctuation: {
    endingSentenceStyle: 'standard',
    commonPunctuationPatterns: [],
    usesPeriods: true,
    usesExclamationMarks: false,
    multipleExclamationMarks: false,
    usesQuestionMarks: true,
    usesEllipsis: false,
    spacingStyle: 'standard',
    multipleMarks: false,
    gapBetweenSentences: "standard"
  },
  vocabulary: {
    commonWords: [],
    uniquePhrases: [],
    acronyms: [],
    slangTerms: [],
    profanity: [],
    hashtagStyle: [],
    commonPhrases: [],
    mentionStyle: [],
    emojiUsage: {
      usesEmojis: false,
      mostUsedEmojis: [],
      emojiFrequency: 0
    },
    technicalTerms: []
  },
  content: {
    mainTopics: [],
    frequentReferences: {
      people: [],
      companies: [],
      products: []
    },
    contentStyle: {
      usesThreads: false,
      includesLinks: false,
      usesMemes: false,
      quoteTweets: false
    }
  }
};

export class AgentTrainingService {
  private async getOrCreateStyleProfile(agentId: string): Promise<StyleProfile> {
    const existingProfile = await prisma.agentStyleProfile.findUnique({
      where: { agentId },
    });

    if (existingProfile) {
      return {
        id: existingProfile.id,
        agentId: existingProfile.agentId,
        writingPatterns: this.parseWritingPatterns(existingProfile.writingPatterns),
        lastUpdated: existingProfile.lastUpdated,
        trainingTweetCount: existingProfile.trainingTweetCount,
      };
    }

    const newProfile = await prisma.agentStyleProfile.create({
      data: {
        agentId,
        writingPatterns: JSON.parse(JSON.stringify(defaultWritingPatterns)) as Prisma.InputJsonValue,
        trainingTweetCount: 0,
      },
    });

    return {
      id: newProfile.id,
      agentId: newProfile.agentId,
      writingPatterns: defaultWritingPatterns,
      lastUpdated: newProfile.lastUpdated,
      trainingTweetCount: newProfile.trainingTweetCount,
    };
  }

  private parseWritingPatterns(jsonValue: any): WritingPatterns {
    if (!jsonValue || typeof jsonValue !== 'object') {
      return defaultWritingPatterns;
    }

    try {
      const parsed = jsonValue as WritingPatterns;
      return {
        casing: {
          usesCapitalization: parsed.casing?.usesCapitalization ?? defaultWritingPatterns.casing.usesCapitalization,
          capitalizedWords: parsed.casing?.capitalizedWords ?? [],
          allCapsWords: parsed.casing?.allCapsWords ?? [],
        },
        punctuation: {
          endingSentenceStyle: parsed.punctuation?.endingSentenceStyle ?? defaultWritingPatterns.punctuation.endingSentenceStyle,
          commonPunctuationPatterns: parsed.punctuation?.commonPunctuationPatterns ?? [],
          usesPeriods: parsed.punctuation?.usesPeriods ?? defaultWritingPatterns.punctuation.usesPeriods,
          usesExclamationMarks: parsed.punctuation?.usesExclamationMarks ?? defaultWritingPatterns.punctuation.usesExclamationMarks,
          multipleExclamationMarks: parsed.punctuation?.multipleExclamationMarks ?? defaultWritingPatterns.punctuation.multipleExclamationMarks,
          usesQuestionMarks: parsed.punctuation?.usesQuestionMarks ?? defaultWritingPatterns.punctuation.usesQuestionMarks,
          usesEllipsis: parsed.punctuation?.usesEllipsis ?? defaultWritingPatterns.punctuation.usesEllipsis,
          spacingStyle: parsed.punctuation?.spacingStyle ?? defaultWritingPatterns.punctuation.spacingStyle,
          multipleMarks: parsed.punctuation?.multipleMarks ?? defaultWritingPatterns.punctuation.multipleMarks,
          gapBetweenSentences: parsed.punctuation?.gapBetweenSentences ?? defaultWritingPatterns.punctuation.gapBetweenSentences,
        },
        vocabulary: {
          commonWords: parsed.vocabulary?.commonWords ?? [],
          uniquePhrases: parsed.vocabulary?.uniquePhrases ?? [],
          acronyms: parsed.vocabulary?.acronyms ?? [],
          slangTerms: parsed.vocabulary?.slangTerms ?? [],
          profanity: parsed.vocabulary?.profanity ?? [],
          hashtagStyle: parsed.vocabulary?.hashtagStyle ?? [],
          commonPhrases: parsed.vocabulary?.commonPhrases ?? [],
          mentionStyle: parsed.vocabulary?.mentionStyle ?? [],
          emojiUsage:
          {
            usesEmojis: parsed.vocabulary?.emojiUsage.usesEmojis ?? true,
            mostUsedEmojis: parsed.vocabulary?.emojiUsage.mostUsedEmojis ?? [],
            emojiFrequency: parsed.vocabulary?.emojiUsage.emojiFrequency ?? 0
          },
          technicalTerms: parsed.vocabulary?.technicalTerms ?? [],
        },
        content: {
          mainTopics: parsed.content?.mainTopics ?? [],
          frequentReferences: {
            people: parsed.content?.frequentReferences?.people ?? [],
            companies: parsed.content?.frequentReferences?.companies ?? [],
            products: parsed.content?.frequentReferences?.products ?? [],
          },
          contentStyle: {
            usesThreads: parsed.content?.contentStyle?.usesThreads ?? false,
            includesLinks: parsed.content?.contentStyle?.includesLinks ?? false,
            usesMemes: parsed.content?.contentStyle?.usesMemes ?? false,
            quoteTweets: parsed.content?.contentStyle?.quoteTweets ?? false,
          },
        }
      };
    } catch {
      return defaultWritingPatterns;
    }
  }

  private mergePatterns(existing: WritingPatterns, newPatterns: any): WritingPatterns {
    return {
      casing: {
        usesCapitalization: newPatterns.casing?.usesCapitalization ?? existing.casing.usesCapitalization,
        capitalizedWords: [...new Set([...existing.casing.capitalizedWords, ...(newPatterns.casing?.capitalizedWords || [])])],
        allCapsWords: [...new Set([...existing.casing.allCapsWords, ...(newPatterns.casing?.allCapsWords || [])])],
      },
      punctuation: {
        endingSentenceStyle: newPatterns.punctuation?.endingSentenceStyle ?? existing.punctuation.endingSentenceStyle,
        commonPunctuationPatterns: existing.punctuation.commonPunctuationPatterns,
        usesPeriods: newPatterns.punctuation?.usesPeriods ?? existing.punctuation.usesPeriods,
        usesExclamationMarks: newPatterns.punctuation?.usesExclamationMarks ?? existing.punctuation.usesExclamationMarks,
        usesQuestionMarks: newPatterns.punctuation?.usesQuestionMarks ?? existing.punctuation.usesQuestionMarks,
        usesEllipsis: newPatterns.punctuation?.usesEllipsis ?? existing.punctuation.usesEllipsis,
        spacingStyle: newPatterns.punctuation?.spacingStyle ?? existing.punctuation.spacingStyle,
        multipleExclamationMarks: newPatterns.punctuation?.multipleMarks ?? existing.punctuation.multipleExclamationMarks,
        multipleMarks: newPatterns.punctuation?.multipleMarks ?? existing.punctuation.multipleMarks,
        gapBetweenSentences: newPatterns.punctuation?.gapBetweenSentences ?? existing.punctuation.gapBetweenSentences
      },
      vocabulary: {
        commonWords: [...new Set([...existing.vocabulary.commonWords, ...(newPatterns.vocabulary?.commonPhrases || [])])],
        uniquePhrases: [...new Set([...existing.vocabulary.uniquePhrases, ...(newPatterns.vocabulary?.commonPhrases || [])])],
        acronyms: [...new Set([...existing.vocabulary.acronyms, ...(newPatterns.vocabulary?.acronyms || [])])],
        slangTerms: [...new Set([...existing.vocabulary.slangTerms, ...(newPatterns.vocabulary?.slangTerms || [])])],
        profanity: [...new Set([...existing.vocabulary.profanity, ...(newPatterns.vocabulary?.profanity || [])])],
        hashtagStyle: [...new Set([...existing.vocabulary.hashtagStyle, ...(newPatterns.vocabulary?.hashtagStyle || [])])],
        commonPhrases: [...new Set([...existing.vocabulary.commonPhrases, ...(newPatterns.vocabulary?.commonPhrases || [])])],
        mentionStyle: existing.vocabulary.mentionStyle,
        emojiUsage: {
          usesEmojis: existing.vocabulary.emojiUsage.usesEmojis ?? newPatterns.vocabulary.emojiUsage.usesEmojis,
          mostUsedEmojis: [...new Set([...existing.vocabulary.emojiUsage.mostUsedEmojis, ...(newPatterns.vocabulary?.emojiUsage.mostUsedEmojis || [])])],
          emojiFrequency: existing.vocabulary.emojiUsage.emojiFrequency ?? newPatterns.vocabulary.emojiUsage.emojiFrequency
        },
        technicalTerms: [...new Set([...existing.vocabulary.technicalTerms || [], ...(newPatterns.vocabulary?.technicalTerms || [])])]
      },
      content: {
        mainTopics: [...new Set([...existing.content?.mainTopics || [], ...(newPatterns.content?.mainTopics || [])])],
        frequentReferences: {
          people: [...new Set([...existing.content?.frequentReferences?.people || [], ...(newPatterns.content?.frequentReferences?.people || [])])],
          companies: [...new Set([...existing.content?.frequentReferences?.companies || [], ...(newPatterns.content?.frequentReferences?.companies || [])])],
          products: [...new Set([...existing.content?.frequentReferences?.products || [], ...(newPatterns.content?.frequentReferences?.products || [])])]
        },
        contentStyle: {
          usesThreads: newPatterns.content?.contentStyle?.usesThreads ?? existing.content?.contentStyle?.usesThreads ?? false,
          includesLinks: newPatterns.content?.contentStyle?.includesLinks ?? existing.content?.contentStyle?.includesLinks ?? false,
          usesMemes: newPatterns.content?.contentStyle?.usesMemes ?? existing.content?.contentStyle?.usesMemes ?? false,
          quoteTweets: newPatterns.content?.contentStyle?.quoteTweets ?? existing.content?.contentStyle?.quoteTweets ?? false
        }
      }
    };
  }

  async trainOnNewTweets(agentId: string, tweets: string[]): Promise<void> {
    const profile = await this.getOrCreateStyleProfile(agentId);
    const totalTweets = tweets.length;

    console.log(`Starting training on ${totalTweets} tweets...`);

    try {
      const analysis = await openai.chat.completions.create({
        model: 'ft:gpt-3.5-turbo-1106:hype3:version3:AovVeiFA',
        messages: [
          {
            role: 'system',
            content: `You are analyzing tweet writing patterns and content. You MUST capture EXACTLY how this person writes and what they talk about. Pay attention to:
      
      1. Writing Style Analysis:
      - Exact capitalization patterns (do they use caps at all? only for emphasis?)
      - Punctuation habits (periods? multiple exclamation marks? ellipsis?)
      - Spacing patterns (extra spaces? no spaces after punctuation?)
      - Sentence structure (short/long? fragments? run-ons?)
      - Informality level (very casual? professional? mix?)
      
      2. Language Patterns:
      - Specific acronyms and abbreviations they use
      - Slang terms and informal language
      - Profanity usage and style
      - Common phrases or expressions they repeat
      - Unique hashtag patterns
      - Emoji placement and frequency
      
      3. Content Analysis:
      - Main topics they discuss
      - How they reference current events
      - Specific products/companies they mention
      - People they frequently reference
      - Technical terms they use
      - Industry-specific jargon
      
      Return ONLY a JSON object with this structure:
      
      {
        "casing": {
          "usesCapitalization": true,
          "capitalizedWords": ["Example", "Words"],
          "allCapsWords": ["IMPORTANT", "NOTE"]
        },
        "punctuation": {
          "endingSentenceStyle": "period",
          "usesPeriods": true,
          "usesExclamationMarks": true,
          "usesQuestionMarks": false,
          "multipleMarks": false,
          "spacingStyle": "standard",
          "gapBetweenSentences": "standard"
        },
        "vocabulary": {
          "commonPhrases": ["example phrase"],
          "slangTerms": ["lol", "brb"],
          "acronyms": ["API", "HTTP"],
          "profanity": ["damn"],
          "hashtagStyle": ["#example"],
          "emojiUsage": {
            "mostUsedEmojis": ["😂", "🔥"],
            "usesEmojis": false, // false if no emojis used
            "emojiFrequency": 0 // Set to 0 if no emojis are used
          },
          "technicalTerms": ["React", "Node.js"]
        },
        "content": {
          "mainTopics": ["coding", "tech"],
          "frequentReferences": {
            "people": ["John Doe"],
            "companies": ["OpenAI"],
            "products": ["ChatGPT"]
          },
          "contentStyle": {
            "usesThreads": false,
            "includesLinks": true,
            "usesMemes": false,
            "quoteTweets": true
          }
        }
      }
      
      IMPORTANT:
      - Return ONLY the JSON object, no other text
      - Ensure all string arrays have 10 or fewer items
      - All boolean values must be true/false, not strings
      - Capture their EXACT writing style for authentic replication`
          },
          {
            role: 'user',
            content: `Analyze these ${totalTweets} tweets and return ONLY the JSON object matching the specified format:
      
      ${tweets.slice(0, 10000).join('\n\n')}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });


      let responseContent = analysis.choices[0].message.content?.replace(/^```json\s*/, '');
      responseContent = responseContent?.replace(/```$/, '');
      if (!responseContent) {
        throw new Error('Empty response from OpenAI');
      }

      try {
        // Pre-process the response to ensure it's valid JSON
        let cleanedResponse = responseContent.trim();
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '');
        cleanedResponse = cleanedResponse.replace(/```$/, '');
        // Validate JSON structure before parsing
        if (!cleanedResponse.startsWith('{') || !cleanedResponse.endsWith('}')) {
          throw new Error('Invalid JSON structure in response');
        }

        const patterns = JSON.parse(cleanedResponse);

        // Validate required structure
        if (!patterns.casing || !patterns.punctuation || !patterns.vocabulary || !patterns.content) {
          throw new Error('Missing required sections in response');
        }

        // Ensure arrays don't exceed max length and remove duplicates
        const limitArrayLength = (arr: string[] = [], maxLength = 10) =>
          [...new Set(arr)].slice(0, maxLength);

        console.log("################ step 1 ##########");
        // Clean up the patterns object
        const cleanedPatterns = {
          casing: {
            usesCapitalization: Boolean(patterns.casing.usesCapitalization),
            capitalizedWords: limitArrayLength(patterns.casing.capitalizedWords),
            allCapsWords: limitArrayLength(patterns.casing.allCapsWords)
          },
          punctuation: {
            endingSentenceStyle: String(patterns.punctuation.endingSentenceStyle),
            usesPeriods: Boolean(patterns.punctuation.usesPeriods),
            usesExclamationMarks: Boolean(patterns.punctuation.usesExclamationMarks),
            usesQuestionMarks: Boolean(patterns.punctuation.usesQuestionMarks),
            multipleMarks: Boolean(patterns.punctuation.multipleMarks),
            spacingStyle: String(patterns.punctuation.spacingStyle),
            gapBetweenSentences: String(patterns.punctuation.gapBetweenSentences)
          },
          vocabulary: {
            commonPhrases: limitArrayLength(patterns.vocabulary.commonPhrases),
            slangTerms: limitArrayLength(patterns.vocabulary.slangTerms),
            acronyms: limitArrayLength(patterns.vocabulary.acronyms),
            profanity: limitArrayLength(patterns.vocabulary.profanity),
            hashtagStyle: limitArrayLength(patterns.vocabulary.hashtagStyle),
            emojiUsage: {
              usesEmojis: Boolean(patterns.punctuation.usesEmojis),
              mostUsedEmojis: limitArrayLength(patterns.vocabulary.mostUsedEmojis),
              emojiFrequency: patterns.vocabulary.emojiFrequency
            },
            technicalTerms: limitArrayLength(patterns.vocabulary.technicalTerms)
          },
          content: {
            mainTopics: limitArrayLength(patterns.content.mainTopics),
            frequentReferences: {
              people: limitArrayLength(patterns.content.frequentReferences.people),
              companies: limitArrayLength(patterns.content.frequentReferences.companies),
              products: limitArrayLength(patterns.content.frequentReferences.products)
            },
            contentStyle: {
              usesThreads: Boolean(patterns.content.contentStyle.usesThreads),
              includesLinks: Boolean(patterns.content.contentStyle.includesLinks),
              usesMemes: Boolean(patterns.content.contentStyle.usesMemes),
              quoteTweets: Boolean(patterns.content.contentStyle.quoteTweets)
            }
          }
        };

        console.log("################ step 2 ##########");

        profile.writingPatterns = this.mergePatterns(profile.writingPatterns, cleanedPatterns);
        profile.trainingTweetCount = totalTweets;

        console.log("################ step 3 ##########");

        console.log('Updating style profile in database...');
        await prisma.agentStyleProfile.update({
          where: { agentId },
          data: {
            writingPatterns: JSON.parse(JSON.stringify(profile.writingPatterns)) as Prisma.InputJsonValue,
            trainingTweetCount: profile.trainingTweetCount,
            lastUpdated: new Date(),
          },
        });
        console.log('Training completed successfully');
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', responseContent);
        //@ts-ignore
        throw new Error(`Failed to parse response: ${parseError.message}`);
      }
    } catch (error) {
      console.error('Error in training:', error);
      throw error;
    }
  }

  async generateTweetBatch(agentId: string, count: number = 3): Promise<string[]> {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        styleProfile: true
      }
    });

    if (!agent || !agent.styleProfile) {
      throw new Error('Agent or style profile not found');
    }

    const writingPatterns = this.parseWritingPatterns(agent.styleProfile.writingPatterns);

    try {
      const completion = await openai.chat.completions.create({
        model: "ft:gpt-3.5-turbo-1106:hype3:version3:AovVeiFA",
        messages: [
          {
            role: "system",
            content: `You are generating tweets that MUST EXACTLY replicate this user's unique writing style:
      
      WRITING STYLE:
      - Capitalization: ${writingPatterns.casing.usesCapitalization ? 'Uses proper caps' : 'Rarely capitalizes'}
      - Common capitalized words: ${writingPatterns.casing.capitalizedWords.join(', ')}
      - Words they write in ALL CAPS: ${writingPatterns.casing.allCapsWords.join(', ')}
      
      EXACT Capitalization: 
      - If they never capitalize, use all lowercase
      - If they use ALL CAPS for emphasis, only capitalize those exact words
      - Match their exact capitalization patterns for proper nouns
      
      PRECISE Punctuation:
      - Use their exact ending style (${writingPatterns.punctuation.endingSentenceStyle})
      - Only use periods if they do (${writingPatterns.punctuation.usesPeriods})
      - Match their exact exclamation/question mark patterns
      - Copy their exact spacing style (${writingPatterns.punctuation.spacingStyle})
      
      VOCABULARY MATCHING:
      - Use their exact slang terms: ${writingPatterns.vocabulary.slangTerms.join(', ')}
      - Copy their acronym usage: ${writingPatterns.vocabulary.acronyms.join(', ')}
      - Match profanity level: ${writingPatterns.vocabulary.profanity.join(', ')}
      - Use their exact emoji patterns: ${writingPatterns.vocabulary.emojiUsage.usesEmojis ? writingPatterns.vocabulary.emojiUsage.mostUsedEmojis.join(', ') : ''}
      
      PUNCTUATION:
      - Ending style: ${writingPatterns.punctuation.endingSentenceStyle}
      - Uses periods: ${writingPatterns.punctuation.usesPeriods}
      - Uses exclamation marks: ${writingPatterns.punctuation.usesExclamationMarks}
      - Uses question marks: ${writingPatterns.punctuation.usesQuestionMarks}
      - Multiple marks: ${writingPatterns.punctuation.multipleMarks}
      - Spacing style: ${writingPatterns.punctuation.spacingStyle}
      - Use their exact ending style (${writingPatterns.punctuation.endingSentenceStyle})
      - Only use periods if they do (${writingPatterns.punctuation.usesPeriods})
      - Match their exact exclamation/question mark patterns
      - Copy their exact spacing style (${writingPatterns.punctuation.spacingStyle})
      
      VOCABULARY:
      - Common phrases: ${writingPatterns.vocabulary.commonPhrases.join(', ')}
      - Slang terms: ${writingPatterns.vocabulary.slangTerms.join(', ')}
      - Acronyms: ${writingPatterns.vocabulary.acronyms.join(', ')}
      - Profanity: ${writingPatterns.vocabulary.profanity.join(', ')}
      - Hashtag style: ${writingPatterns.vocabulary.hashtagStyle.join(', ')}
      - Emoji usage: ${writingPatterns.vocabulary.emojiUsage.usesEmojis ? writingPatterns.vocabulary.emojiUsage.mostUsedEmojis.join(', ') : ''}
      - Technical terms: ${writingPatterns.vocabulary.technicalTerms.join(', ')}
      - Use their exact slang terms: ${writingPatterns.vocabulary.slangTerms.join(', ')}
      - Copy their acronym usage: ${writingPatterns.vocabulary.acronyms.join(', ')}
      - Match profanity level: ${writingPatterns.vocabulary.profanity.join(', ')}
      - Use their exact emoji patterns: ${writingPatterns.vocabulary.emojiUsage.usesEmojis ? writingPatterns.vocabulary.emojiUsage.mostUsedEmojis.join(', ') : ''}
      
      CONTENT FOCUS:
      - Main topics: ${writingPatterns.content.mainTopics.join(', ')}
      - Referenced people: ${writingPatterns.content.frequentReferences.people.join(', ')}
      
      STRUCTURAL ELEMENTS:
      - Match their typical tweet length
      - Copy their hashtag placement: ${writingPatterns.vocabulary.hashtagStyle.join(', ')}
      - Use their exact thread style (${writingPatterns.content.contentStyle.usesThreads ? 'creates threads' : 'single tweets'})
      - Mirror their link sharing habits (${writingPatterns.content.contentStyle.includesLinks ? 'includes links' : 'rarely links'})
      
      PERSONALITY: ${agent.personality}
      CHARACTER: ${agent.character}
      
      You must:
      1. Write in their EXACT style (capitalization, punctuation, informality)
      2. Use their typical phrases and expressions
      3. Discuss topics they usually talk about
      4. Match their emoji and hashtag usage patterns
      5. Maintain their level of technical language
      6. Keep their typical tweet length and structure`
          },
          {
            role: "user",
            content: `Generate ${count} unique tweets that perfectly match this style and discuss their usual topics. Return only the tweets, one per line.`
          }
        ],
        temperature: 0.7,
      });


      return completion.choices[0].message.content?.split('\n').filter(t => t.trim()) || [];
    } catch (error) {
      console.error('Error generating tweets:', error);
      throw error;
    }
  }
} 