-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "post24Hours" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postingEndHour" INTEGER NOT NULL DEFAULT 21,
ADD COLUMN     "postingStartHour" INTEGER NOT NULL DEFAULT 9,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- CreateTable
CREATE TABLE "TweetLog" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "likes" INTEGER,
    "retweets" INTEGER,
    "replies" INTEGER,
    "agentId" TEXT NOT NULL,

    CONSTRAINT "TweetLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TweetLog" ADD CONSTRAINT "TweetLog_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
