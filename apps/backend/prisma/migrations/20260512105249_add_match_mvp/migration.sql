-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "mvpId" TEXT;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "mvpCount" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_mvpId_fkey" FOREIGN KEY ("mvpId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
