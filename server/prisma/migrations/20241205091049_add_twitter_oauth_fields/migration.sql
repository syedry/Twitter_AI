-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "lastTweetAt" TIMESTAMP(3),
ADD COLUMN     "twitterAccessToken" TEXT,
ADD COLUMN     "twitterRefreshToken" TEXT,
ADD COLUMN     "twitterUsername" TEXT;
