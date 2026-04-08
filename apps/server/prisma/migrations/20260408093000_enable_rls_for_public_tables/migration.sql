-- Enable RLS on public tables exposed to PostgREST.
ALTER TABLE "SmokeRecord" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "TravelRecord" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
