import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'node:url'

import { PHASE11_SMOKE_RECORD_REQUEST } from '@trip-map/contracts'

import { createApp } from '../src/main.js'

try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)))
}
catch {
  // The test runner may inject envs directly.
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

process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL)
process.env.DIRECT_URL = normalizeDatabaseUrl(process.env.DIRECT_URL)
process.env.SHADOW_DATABASE_URL = normalizeDatabaseUrl(process.env.SHADOW_DATABASE_URL)

const smokeRequest = {
  ...PHASE11_SMOKE_RECORD_REQUEST,
  datasetVersion: `${PHASE11_SMOKE_RECORD_REQUEST.datasetVersion}-postgres-suite`,
}

describe('POST /records/smoke with PostgreSQL', () => {
  let app: NestFastifyApplication
  const prisma = new PrismaClient()

  beforeAll(async () => {
    app = await createApp()
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await prisma.smokeRecord.deleteMany({
      where: {
        datasetVersion: smokeRequest.datasetVersion,
      },
    })
  })

  afterAll(async () => {
    await prisma.smokeRecord.deleteMany({
      where: {
        datasetVersion: smokeRequest.datasetVersion,
      },
    })
    await prisma.$disconnect()
    await app.close()
  })

  it('persists one smoke record and returns canonical field names unchanged', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/records/smoke',
      payload: smokeRequest,
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject(smokeRequest)

    const storedRows = await prisma.smokeRecord.findMany({
      where: {
        datasetVersion: smokeRequest.datasetVersion,
      },
    })

    expect(storedRows).toHaveLength(1)
    expect(storedRows[0]).toMatchObject(smokeRequest)
    expect(storedRows[0]).toMatchObject({
      regionSystem: smokeRequest.regionSystem,
      adminType: smokeRequest.adminType,
      typeLabel: smokeRequest.typeLabel,
      parentLabel: smokeRequest.parentLabel,
      subtitle: smokeRequest.subtitle,
    })
  })
})
