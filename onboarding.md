# TweetForge AI - Developer Onboarding

## Project Overview
TweetForge AI is a Twitter automation platform that creates AI agents capable of mimicking a user's writing style. The platform analyzes existing tweets, learns the user's writing patterns, and generates new tweets that maintain the same style and personality.

## Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL with Prisma ORM
- AI: OpenAI GPT-4 API
- Twitter Integration: Twitter API v2
- Tweet Scraping: Apify Twitter Scraper

## Core Features

### 1. Agent Creation & Management
- Users can create AI agents based on existing Twitter accounts
- Each agent learns from the target account's writing style
- Agents can be configured with:
  - Tweet frequency
  - Posting schedule
  - Personality traits
  - Language style

### 2. Tweet Analysis & Learning
- Scrapes recent tweets using Apify
- Analyzes writing patterns including:
  - Capitalization style
  - Punctuation usage
  - Vocabulary and slang
  - Emoji patterns
  - Hashtag usage

### 3. Tweet Generation
- Generates tweets matching the learned style
- Maintains consistent tone and personality
- Respects user-defined posting schedule
- Includes engagement patterns (hashtags, mentions, etc.)

### 4. Twitter Integration
- OAuth 2.0 authentication
- Automated posting
- Analytics tracking (likes, retweets, replies)

## Database Schema

### Key Tables
1. `Agent`
   - Stores AI agent configurations
   - Links to Twitter credentials
   - Contains scheduling preferences

2. `Tweet`
   - Stores scraped tweets for analysis
   - Tracks engagement metrics
   - Links to source user

3. `ScrapedUser`
   - Manages tweet scraping history
   - Tracks last update time
   - Links to collected tweets

4. `AgentStyleProfile`
   - Stores analyzed writing patterns
   - Contains training data
   - Links to agent

5. `TweetLog`
   - Records generated/posted tweets
   - Tracks posting success/failure
   - Stores engagement metrics

## Key Components

### Frontend (`/src`)

#### Pages
- `CreateAgent.tsx`: Agent creation wizard
- `Dashboard.tsx`: Main agent management interface
- `Schedule.tsx`: Posting schedule configuration
- `ConnectTwitter.tsx`: Twitter OAuth flow
- `Logs.tsx`: Tweet history and analytics

#### Components
- `AgentCard.tsx`: Agent display and controls
- `TweetPreview.tsx`: Tweet preview with metrics
- `Layout.tsx`: Common layout and navigation

### Backend (`/server/src`)

#### Services
1. `AgentService.ts`
   - Creates and manages agents
   - Handles agent configuration
   - Coordinates training and generation

2. `AgentTrainingService.ts`
   - Analyzes writing patterns
   - Trains on user tweets
   - Generates new tweets
   - Key methods:
     - `trainOnNewTweets()`: Processes tweets for learning
     - `generateTweetBatch()`: Creates new tweets
     - `analyzeTweet()`: Extracts writing patterns

3. `TwitterService.ts`
   - Manages Twitter API integration
   - Handles tweet scraping
   - Posts generated tweets
   - Key methods:
     - `getUserTweets()`: Fetches user's tweets
     - `getOrCreateScrapedUser()`: Manages tweet collection

4. `TweetSchedulerService.ts`
   - Manages posting schedule
   - Handles tweet queuing
   - Ensures posting frequency

#### Routes
1. `agent.ts`
   - `/api/agents`: CRUD operations for agents
   - `/api/agents/simulate`: Test tweet generation
   - `/api/agents/:id/train`: Trigger training

2. `auth.ts`
   - `/api/auth/twitter/connect`: Start OAuth flow
   - `/api/auth/twitter/callback`: OAuth callback
   - `/api/auth/twitter/disconnect`: Remove Twitter connection

3. `tweet.ts`
   - `/api/tweets/scrape`: Trigger tweet scraping
   - `/api/tweets/:handle`: Get stored tweets

## Environment Setup

### Required Environment Variables
```env
# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://..."

# API Keys
OPENAI_API_KEY="sk-..."
APIFY_API_KEY="apify_api_..."

# Twitter OAuth
TWITTER_CLIENT_ID="..."
TWITTER_CLIENT_SECRET="..."
TWITTER_CALLBACK_URL="..."
```

## Development Workflow

1. **Local Setup**
   ```bash
   # Install dependencies
   npm install
   cd server && npm install

   # Start development servers
   npm run dev          # Frontend
   cd server && npm run dev  # Backend
   ```

2. **Database Management**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Reset database
   npx prisma migrate reset
   ```

3. **Testing Tweet Generation**
   - Use the "Simulate" button in agent creation
   - Check logs for training progress
   - Review generated tweets in preview

## Common Tasks

### Adding New Features
1. Update Prisma schema if needed
2. Generate migrations
3. Update relevant services
4. Add API endpoints
5. Implement frontend components

### Debugging
1. Check server logs for API errors
2. Review training progress in console
3. Verify Twitter API responses
4. Check database for stored tweets

### Performance Optimization
- Tweet analysis is batched for efficiency
- Training uses recent tweets first
- Caching implemented for frequent requests
- Rate limiting handled automatically

## Deployment

See `do_deployment.md` for detailed Digital Ocean deployment instructions.

## Additional Resources
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Twitter API Documentation](https://developer.twitter.com/en/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Apify Twitter Scraper](https://apify.com/apidojo/tweet-scraper) 