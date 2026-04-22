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

type BackfillRow = {
  id: string
  placeId: string
}

type SkippedBackfillRow = {
  id: string
  placeId: string
}

type BackfillUpdateManyDelegate = {
  updateMany(args: {
    where: { id: string }
    data: CanonicalMetadata
  }): Promise<{ count: number }>
}

type BackfillTableDelegate = BackfillUpdateManyDelegate & {
  findMany(args: {
    select: {
      id: true
      placeId: true
    }
  }): Promise<BackfillRow[]>
}

type BackfillPrismaClient = {
  travelRecord: BackfillTableDelegate
  smokeRecord: BackfillTableDelegate
  userTravelRecord: BackfillTableDelegate
}

type BackfillUpdateResult =
  | { outcome: 'matched'; metadata: CanonicalMetadata }
  | { outcome: 'skipped'; metadata: CanonicalMetadata }
  | { outcome: 'unmatched' }

export type BackfillSummary = {
  matchedTravelRows: number
  unmatchedTravelRows: string[]
  skippedTravelRows: SkippedBackfillRow[]
  matchedSmokeRows: number
  unmatchedSmokeRows: string[]
  skippedSmokeRows: SkippedBackfillRow[]
  matchedUserTravelRows: number
  unmatchedUserTravelRows: string[]
  skippedUserTravelRows: SkippedBackfillRow[]
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

export function buildUserTravelMetadataUpdate(
  placeId: string,
  lookup: CanonicalMetadataLookup,
): CanonicalMetadata | null {
  return lookup.get(placeId) ?? null
}

export async function applyBackfillUpdate(
  row: BackfillRow,
  lookup: CanonicalMetadataLookup,
  delegate: BackfillUpdateManyDelegate,
): Promise<BackfillUpdateResult> {
  const metadata = lookup.get(row.placeId)

  if (!metadata) {
    return { outcome: 'unmatched' }
  }

  const result = await delegate.updateMany({
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

  if (result.count === 1) {
    return { outcome: 'matched', metadata }
  }

  if (result.count === 0) {
    return { outcome: 'skipped', metadata }
  }

  throw new Error(
    `Expected updateMany() for row "${row.id}" (${row.placeId}) to affect at most one row, received count ${result.count}.`,
  )
}

function createPrismaClient() {
  loadServerEnvFile()
  return new PrismaClient()
}

export async function backfillRecordMetadata(
  prisma: BackfillPrismaClient,
  lookup: CanonicalMetadataLookup = buildCanonicalMetadataLookup(),
): Promise<BackfillSummary> {
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
  const userTravelRows = await prisma.userTravelRecord.findMany({
    select: {
      id: true,
      placeId: true,
    },
  })

  const summary: BackfillSummary = {
    matchedTravelRows: 0,
    unmatchedTravelRows: [],
    skippedTravelRows: [],
    matchedSmokeRows: 0,
    unmatchedSmokeRows: [],
    skippedSmokeRows: [],
    matchedUserTravelRows: 0,
    unmatchedUserTravelRows: [],
    skippedUserTravelRows: [],
  }

  for (const row of travelRows) {
    const result = await applyBackfillUpdate(row, lookup, prisma.travelRecord)

    if (result.outcome === 'unmatched') {
      summary.unmatchedTravelRows.push(row.placeId)
      continue
    }

    if (result.outcome === 'skipped') {
      summary.skippedTravelRows.push({ id: row.id, placeId: row.placeId })
      continue
    }

    summary.matchedTravelRows += 1
  }

  for (const row of smokeRows) {
    const result = await applyBackfillUpdate(row, lookup, prisma.smokeRecord)

    if (result.outcome === 'unmatched') {
      summary.unmatchedSmokeRows.push(row.placeId)
      continue
    }

    if (result.outcome === 'skipped') {
      summary.skippedSmokeRows.push({ id: row.id, placeId: row.placeId })
      continue
    }

    summary.matchedSmokeRows += 1
  }

  for (const row of userTravelRows) {
    const result = await applyBackfillUpdate(row, lookup, prisma.userTravelRecord)

    if (result.outcome === 'unmatched') {
      summary.unmatchedUserTravelRows.push(row.placeId)
      continue
    }

    if (result.outcome === 'skipped') {
      summary.skippedUserTravelRows.push({ id: row.id, placeId: row.placeId })
      continue
    }

    summary.matchedUserTravelRows += 1
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
          skippedTravelRows: summary.skippedTravelRows,
          matchedSmokeRows: summary.matchedSmokeRows,
          unmatchedSmokeRows: summary.unmatchedSmokeRows,
          skippedSmokeRows: summary.skippedSmokeRows,
          matchedUserTravelRows: summary.matchedUserTravelRows,
          unmatchedUserTravelRows: summary.unmatchedUserTravelRows,
          skippedUserTravelRows: summary.skippedUserTravelRows,
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
