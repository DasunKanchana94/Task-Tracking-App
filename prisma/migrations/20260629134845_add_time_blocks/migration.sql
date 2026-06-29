-- CreateTable
CREATE TABLE "time_blocks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT,
    "title" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "source" TEXT NOT NULL DEFAULT 'local',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "time_blocks_userId_startAt_endAt_idx" ON "time_blocks"("userId", "startAt", "endAt");

-- CreateIndex
CREATE INDEX "time_blocks_taskId_idx" ON "time_blocks"("taskId");

-- AddForeignKey
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
