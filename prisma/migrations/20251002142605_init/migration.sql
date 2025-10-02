-- CreateTable
CREATE TABLE "EnrollmentGoal" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "target" INTEGER NOT NULL DEFAULT 0,
    "achieved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnrollmentGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnrollmentGoal_category_key" ON "EnrollmentGoal"("category");
