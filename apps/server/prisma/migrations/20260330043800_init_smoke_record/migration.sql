CREATE TABLE "SmokeRecord" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "boundaryId" TEXT NOT NULL,
    "placeKind" TEXT NOT NULL,
    "datasetVersion" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmokeRecord_pkey" PRIMARY KEY ("id")
);
