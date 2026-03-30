import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'node:url'

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
    process.loadEnvFile(fileURLToPath(new URL('../../.env', import.meta.url)))
  }
  catch {
    // Tests and local dev may inject envs through other mechanisms.
  }

  process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL)
  process.env.DIRECT_URL = normalizeDatabaseUrl(process.env.DIRECT_URL)
  process.env.SHADOW_DATABASE_URL = normalizeDatabaseUrl(process.env.SHADOW_DATABASE_URL)
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    loadServerEnvFile()
    super()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
