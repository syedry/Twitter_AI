-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "twitterHandle" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "tweetPriorities" TEXT NOT NULL,
    "languageStyle" TEXT NOT NULL,
    "tweetsPerDay" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapedUser" (
    "id" TEXT NOT NULL,
    "twitterHandle" TEXT NOT NULL,
    "lastScrapedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tweet" (
    "id" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "likesCount" INTEGER NOT NULL,
    "retweetsCount" INTEGER NOT NULL,
    "repliesCount" INTEGER NOT NULL,
    "scrapedUserId" TEXT NOT NULL,

    CONSTRAINT "Tweet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScrapedUser_twitterHandle_key" ON "ScrapedUser"("twitterHandle");

-- CreateIndex
CREATE UNIQUE INDEX "Tweet_tweetId_key" ON "Tweet"("tweetId");

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_scrapedUserId_fkey" FOREIGN KEY ("scrapedUserId") REFERENCES "ScrapedUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
