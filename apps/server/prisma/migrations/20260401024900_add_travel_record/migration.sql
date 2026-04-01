-- CreateTable
CREATE TABLE "TravelRecord" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "boundaryId" TEXT NOT NULL,
    "placeKind" TEXT NOT NULL,
    "datasetVersion" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelRecord_placeId_key" ON "TravelRecord"("placeId");
