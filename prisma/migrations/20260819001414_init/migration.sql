-- CreateEnum
CREATE TYPE "GameLanguage" AS ENUM ('arabic', 'arabizi');

-- CreateEnum
CREATE TYPE "UiLanguage" AS ENUM ('en', 'fr', 'ar');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('in_progress', 'won', 'lost');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "preferredUiLanguage" "UiLanguage" NOT NULL DEFAULT 'en',
    "preferredGameLanguage" "GameLanguage" NOT NULL DEFAULT 'arabizi',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "language" "GameLanguage" NOT NULL,
    "length" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'in_progress',
    "attempts" JSONB NOT NULL DEFAULT '[]',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "lastGuessAt" TIMESTAMP(3),

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_score_createdAt_idx" ON "User"("score" DESC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "Word_language_isActive_length_idx" ON "Word"("language", "isActive", "length");

-- CreateIndex
CREATE UNIQUE INDEX "Word_text_language_key" ON "Word"("text", "language");

-- CreateIndex
CREATE INDEX "GameSession_userId_status_startedAt_idx" ON "GameSession"("userId", "status", "startedAt" DESC);

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
