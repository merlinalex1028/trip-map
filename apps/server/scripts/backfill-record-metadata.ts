import { PrismaClient } from '@prisma/client'
import type { CanonicalPlaceSummary } from '@trip-map/contracts'
import { fileURLToPath } from 'node:url'

import { buildCanonicalMetadataLookup as buildManifestCanonicalMetadataLookup } from '../src/modules/canonical-places/place-metadata-catalog.js'

type CanonicalMetadata = Pick<
  CanonicalPlaceSummary,
  | 'datasetVersion'
  | 'displayName'
  | 'regionSystem'
  | 'adminType'
  | 'typeLabel'
  | 'parentLabel'
  | 'subtitle'
>

type CanonicalMetadataLookup = ReadonlyMap<string, CanonicalMetadata>

type BackfillSummary = {
  matchedTravelRows: number
  unmatchedTravelRows: string[]
  matchedSmokeRows: number
  unmatchedSmokeRows: string[]
}

function normalizeDatabaseUrl(value: string | undefined): string | undefined {
  if (!value) {
    return value
  }

  try {
    new URL(value)
    return value
  }
  catch {
    const match = value.match(/^(postgres(?:ql)?):\/\/([^:]+):([^@]+)@(.*)$/)

    if (!match) {
      return value
    }

    const [, protocol, user, password, rest] = match
    return `${protocol}://${user}:${encodeURIComponent(password)}@${rest}`
  }
}

function loadServerEnvFile() {
  try {
    process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)))
  }
  catch {
    // Shell-injected envs are also supported.
  }

  process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL)
  process.env.DIRECT_URL = normalizeDatabaseUrl(process.env.DIRECT_URL)
  process.env.SHADOW_DATABASE_URL = normalizeDatabaseUrl(process.env.SHADOW_DATABASE_URL)
}

export function buildCanonicalMetadataLookup(): CanonicalMetadataLookup {
  const { byPlaceId } = buildManifestCanonicalMetadataLookup()

  return new Map(
    [...byPlaceId.entries()].map(([placeId, place]) => [
      placeId,
      {
        datasetVersion: place.datasetVersion,
        displayName: place.displayName,
        regionSystem: place.regionSystem,
        adminType: place.adminType,
        typeLabel: place.typeLabel,
        parentLabel: place.parentLabel,
        subtitle: place.subtitle,
      },
    ]),
  )
}

export function buildTravelMetadataUpdate(
  placeId: string,
  lookup: CanonicalMetadataLookup,
): CanonicalMetadata | null {
  return lookup.get(placeId) ?? null
}

export function buildSmokeMetadataUpdate(
  placeId: string,
  lookup: CanonicalMetadataLookup,
): CanonicalMetadata | null {
  return lookup.get(placeId) ?? null
}

function createPrismaClient() {
  loadServerEnvFile()
  return new PrismaClient()
}

export async function backfillRecordMetadata(prisma: PrismaClient): Promise<BackfillSummary> {
  const lookup = buildCanonicalMetadataLookup()
  const travelRows = await prisma.travelRecord.findMany({
    select: {
      id: true,
      placeId: true,
    },
  })
  const smokeRows = await prisma.smokeRecord.findMany({
    select: {
      id: true,
      placeId: true,
    },
  })

  const summary: BackfillSummary = {
    matchedTravelRows: 0,
    unmatchedTravelRows: [],
    matchedSmokeRows: 0,
    unmatchedSmokeRows: [],
  }

  for (const row of travelRows) {
    const metadata = buildTravelMetadataUpdate(row.placeId, lookup)

    if (!metadata) {
      summary.unmatchedTravelRows.push(row.placeId)
      continue
    }

    await prisma.travelRecord.update({
      where: { id: row.id },
      data: {
        datasetVersion: metadata.datasetVersion,
        displayName: metadata.displayName,
        regionSystem: metadata.regionSystem,
        adminType: metadata.adminType,
        typeLabel: metadata.typeLabel,
        parentLabel: metadata.parentLabel,
        subtitle: metadata.subtitle,
      },
    })
    summary.matchedTravelRows += 1
  }

  for (const row of smokeRows) {
    const metadata = buildSmokeMetadataUpdate(row.placeId, lookup)

    if (!metadata) {
      summary.unmatchedSmokeRows.push(row.placeId)
      continue
    }

    await prisma.smokeRecord.update({
      where: { id: row.id },
      data: {
        datasetVersion: metadata.datasetVersion,
        displayName: metadata.displayName,
        regionSystem: metadata.regionSystem,
        adminType: metadata.adminType,
        typeLabel: metadata.typeLabel,
        parentLabel: metadata.parentLabel,
        subtitle: metadata.subtitle,
      },
    })
    summary.matchedSmokeRows += 1
  }

  return summary
}

async function main() {
  const prisma = createPrismaClient()

  try {
    const summary = await backfillRecordMetadata(prisma)

    console.log(
      JSON.stringify(
        {
          matchedTravelRows: summary.matchedTravelRows,
          unmatchedTravelRows: summary.unmatchedTravelRows,
          matchedSmokeRows: summary.matchedSmokeRows,
          unmatchedSmokeRows: summary.unmatchedSmokeRows,
        },
        null,
        2,
      ),
    )
  }
  finally {
    await prisma.$disconnect()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main()
}
