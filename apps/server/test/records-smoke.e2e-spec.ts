import { config as loadEnv } from 'dotenv'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { PrismaClient } from '@prisma/client'

import { PHASE11_SMOKE_RECORD_REQUEST } from '@trip-map/contracts'

import { createApp } from '../src/main.js'

loadEnv({
  path: new URL('../.env', import.meta.url),
})

describe('POST /records/smoke with PostgreSQL', () => {
  let app: NestFastifyApplication
  const prisma = new PrismaClient()

  beforeAll(async () => {
    app = await createApp()
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await prisma.smokeRecord.deleteMany({
      where: {
        datasetVersion: PHASE11_SMOKE_RECORD_REQUEST.datasetVersion,
      },
    })
  })

  afterAll(async () => {
    await prisma.smokeRecord.deleteMany({
      where: {
        datasetVersion: PHASE11_SMOKE_RECORD_REQUEST.datasetVersion,
      },
    })
    await prisma.$disconnect()
    await app.close()
  })

  it('persists one smoke record and returns canonical field names unchanged', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/records/smoke',
      payload: PHASE11_SMOKE_RECORD_REQUEST,
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject(PHASE11_SMOKE_RECORD_REQUEST)

    const storedRows = await prisma.smokeRecord.findMany({
      where: {
        datasetVersion: PHASE11_SMOKE_RECORD_REQUEST.datasetVersion,
      },
    })

    expect(storedRows).toHaveLength(1)
    expect(storedRows[0]).toMatchObject(PHASE11_SMOKE_RECORD_REQUEST)
  })
})
