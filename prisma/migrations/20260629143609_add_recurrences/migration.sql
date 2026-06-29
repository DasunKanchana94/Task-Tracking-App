-- CreateEnum
CREATE TYPE "RecurrenceExceptionAction" AS ENUM ('skip', 'modified');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "recurrenceId" TEXT,
ADD COLUMN     "recurrenceInstanceDate" DATE;

-- CreateTable
CREATE TABLE "recurrences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rrule" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "endCount" INTEGER,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "taskTemplate" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurrence_exceptions" (
    "id" TEXT NOT NULL,
    "recurrenceId" TEXT NOT NULL,
    "exceptionDate" DATE NOT NULL,
    "action" "RecurrenceExceptionAction" NOT NULL,
    "modifiedTaskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurrence_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurrences_userId_idx" ON "recurrences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "recurrence_exceptions_recurrenceId_exceptionDate_key" ON "recurrence_exceptions"("recurrenceId", "exceptionDate");

-- CreateIndex
CREATE INDEX "tasks_recurrenceId_idx" ON "tasks"("recurrenceId");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_recurrenceId_fkey" FOREIGN KEY ("recurrenceId") REFERENCES "recurrences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence_exceptions" ADD CONSTRAINT "recurrence_exceptions_recurrenceId_fkey" FOREIGN KEY ("recurrenceId") REFERENCES "recurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence_exceptions" ADD CONSTRAINT "recurrence_exceptions_modifiedTaskId_fkey" FOREIGN KEY ("modifiedTaskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
