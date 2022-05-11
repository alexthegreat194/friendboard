/*
  Warnings:

  - Added the required column `groupId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserInGroup" DROP CONSTRAINT "UserInGroup_groupId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "groupId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserInGroup" ADD CONSTRAINT "UserInGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
