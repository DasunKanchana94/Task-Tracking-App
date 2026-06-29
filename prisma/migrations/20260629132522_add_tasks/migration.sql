-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentTaskId" TEXT,
    "title" TEXT NOT NULL,
    "descriptionRich" JSONB,
    "status" "TaskStatus" NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "dueDate" DATE,
    "dueTime" TEXT,
    "estimatedMinutes" INTEGER,
    "actualMinutes" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "emoji" TEXT,
    "sortOrder" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_userId_dueDate_idx" ON "tasks"("userId", "dueDate");

-- CreateIndex
CREATE INDEX "tasks_parentTaskId_idx" ON "tasks"("parentTaskId");

-- CreateIndex
CREATE INDEX "tasks_userId_status_idx" ON "tasks"("userId", "status");

-- CreateIndex
CREATE INDEX "tasks_userId_deletedAt_idx" ON "tasks"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "tasks_userId_starred_idx" ON "tasks"("userId", "starred");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
