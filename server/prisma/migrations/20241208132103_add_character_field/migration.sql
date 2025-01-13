-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "character" TEXT NOT NULL DEFAULT 'default';

-- CreateTable
CREATE TABLE "AgentStyleProfile" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "writingPatterns" JSONB NOT NULL,
    "trainingTweetCount" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentStyleProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentStyleProfile_agentId_key" ON "AgentStyleProfile"("agentId");

-- AddForeignKey
ALTER TABLE "AgentStyleProfile" ADD CONSTRAINT "AgentStyleProfile_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
