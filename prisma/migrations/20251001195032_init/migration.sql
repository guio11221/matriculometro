-- CreateTable
CREATE TABLE "EnrollmentGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "target" INTEGER NOT NULL DEFAULT 0,
    "achieved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EnrollmentGoal_category_key" ON "EnrollmentGoal"("category");
