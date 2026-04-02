-- AlterTable
ALTER TABLE "SmokeRecord" ADD COLUMN     "adminType" TEXT,
ADD COLUMN     "parentLabel" TEXT,
ADD COLUMN     "regionSystem" TEXT,
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "typeLabel" TEXT;

-- AlterTable
ALTER TABLE "TravelRecord" ADD COLUMN     "adminType" TEXT,
ADD COLUMN     "parentLabel" TEXT,
ADD COLUMN     "regionSystem" TEXT,
ADD COLUMN     "typeLabel" TEXT;
