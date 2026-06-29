-- CreateTable
CREATE TABLE "day_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blocks" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "day_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "day_templates_userId_idx" ON "day_templates"("userId");

-- AddForeignKey
ALTER TABLE "day_templates" ADD CONSTRAINT "day_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
