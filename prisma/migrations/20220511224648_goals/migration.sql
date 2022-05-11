-- CreateTable
CREATE TABLE "GroupGoal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "creatorId" INTEGER NOT NULL,

    CONSTRAINT "GroupGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupGoalContribution" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "groupGoalId" INTEGER NOT NULL,

    CONSTRAINT "GroupGoalContribution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GroupGoal" ADD CONSTRAINT "GroupGoal_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupGoal" ADD CONSTRAINT "GroupGoal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupGoalContribution" ADD CONSTRAINT "GroupGoalContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupGoalContribution" ADD CONSTRAINT "GroupGoalContribution_groupGoalId_fkey" FOREIGN KEY ("groupGoalId") REFERENCES "GroupGoal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
