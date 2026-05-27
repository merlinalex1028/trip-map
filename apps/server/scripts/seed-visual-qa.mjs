const VISUAL_QA_EMAIL = 'visual-qa@example.test'
const VISUAL_QA_PASSWORD = 'VisualQa2026!'
const VISUAL_QA_USERNAME = '视觉 QA 长用户名用于验证侧栏文本不会溢出'

const RECORD_FIXTURES = [
  {
    placeId: 'cn-beijing',
    boundaryId: 'datav-cn-beijing',
    placeKind: 'CN_ADMIN',
    datasetVersion: 'canonical-authoritative-2026-04-21',
    displayName: '北京',
    regionSystem: 'CN',
    adminType: 'MUNICIPALITY',
    typeLabel: '直辖市',
    parentLabel: '中国',
    subtitle: '中国 · 直辖市',
    startDate: '2025-01-18',
    endDate: '2025-01-22',
    notes: '冬日北京视觉 QA 记录：故宫、胡同与长备注文本用于检查旅途手账卡片换行和摘要截断，不应挤压操作按钮。',
    tags: ['城市漫步', '文化', '长文本验证'],
  },
  {
    placeId: 'us-california',
    boundaryId: 'ne-admin1-us-california',
    placeKind: 'OVERSEAS_ADMIN1',
    datasetVersion: 'canonical-authoritative-2026-04-21',
    displayName: 'California',
    regionSystem: 'OVERSEAS',
    adminType: 'ADMIN1',
    typeLabel: 'State',
    parentLabel: 'United States',
    subtitle: 'United States · State',
    startDate: '2025-04-09',
    endDate: '2025-04-16',
    notes: 'Pacific coast route for validating saved star markers on the map and country distribution charts.',
    tags: ['海岸线', 'Road Trip'],
  },
  {
    placeId: 'jp-tokyo',
    boundaryId: 'ne-admin1-jp-tokyo',
    placeKind: 'OVERSEAS_ADMIN1',
    datasetVersion: 'canonical-authoritative-2026-04-21',
    displayName: 'Tokyo',
    regionSystem: 'OVERSEAS',
    adminType: 'ADMIN1',
    typeLabel: 'Prefecture',
    parentLabel: 'Japan',
    subtitle: 'Japan · Prefecture',
    startDate: '2025-08-03',
    endDate: '2025-08-07',
    notes: '夏日东京 QA 足迹，用于生成月度趋势、年度趋势和回忆画像图表。',
    tags: ['美食', '展览', '城市夜景'],
  },
  {
    placeId: 'de-saxony',
    boundaryId: 'ne-admin1-de-saxony',
    placeKind: 'OVERSEAS_ADMIN1',
    datasetVersion: 'canonical-authoritative-2026-04-21',
    displayName: 'Saxony',
    regionSystem: 'OVERSEAS',
    adminType: 'ADMIN1',
    typeLabel: 'State',
    parentLabel: 'Germany',
    subtitle: 'Germany · State',
    startDate: '2026-02-12',
    endDate: '2026-02-15',
    notes: 'Saxony record keeps the memories dashboard populated across multiple countries and years.',
    tags: ['博物馆', '建筑', '冬季'],
  },
]

function normalizeDatabaseUrl(value) {
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
    process.loadEnvFile(new URL('../.env', import.meta.url))
  }
  catch {
    // Shell-injected environment variables are also supported.
  }

  process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL)
  process.env.DIRECT_URL = normalizeDatabaseUrl(process.env.DIRECT_URL)
  process.env.SHADOW_DATABASE_URL = normalizeDatabaseUrl(process.env.SHADOW_DATABASE_URL)
}

function assertIsoDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must be YYYY-MM-DD, received ${value}`)
  }

  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) {
    throw new Error(`${label} is not a valid calendar date: ${value}`)
  }
}

function validateFixtures(fixtures) {
  if (fixtures.length < 4) {
    throw new Error(`Expected at least four QA records, received ${fixtures.length}`)
  }

  const requiredPlaceIds = new Set([
    'cn-beijing',
    'us-california',
    'jp-tokyo',
    'de-saxony',
  ])
  const seenPlaceIds = new Set()

  for (const fixture of fixtures) {
    seenPlaceIds.add(fixture.placeId)
    assertIsoDate(fixture.startDate, `${fixture.placeId}.startDate`)
    if (fixture.endDate) {
      assertIsoDate(fixture.endDate, `${fixture.placeId}.endDate`)
      if (fixture.endDate < fixture.startDate) {
        throw new Error(`${fixture.placeId}.endDate must be >= startDate`)
      }
    }
    if (!Array.isArray(fixture.tags) || fixture.tags.length === 0) {
      throw new Error(`${fixture.placeId}.tags must contain at least one tag`)
    }
  }

  for (const placeId of requiredPlaceIds) {
    if (!seenPlaceIds.has(placeId)) {
      throw new Error(`Missing required QA record fixture: ${placeId}`)
    }
  }

  if (seenPlaceIds.size !== fixtures.length) {
    throw new Error('QA record fixtures must have unique placeId values')
  }
}

function toUserTravelRecordCreateInput(userId, fixture) {
  return {
    userId,
    placeId: fixture.placeId,
    boundaryId: fixture.boundaryId,
    placeKind: fixture.placeKind,
    datasetVersion: fixture.datasetVersion,
    displayName: fixture.displayName,
    regionSystem: fixture.regionSystem,
    adminType: fixture.adminType,
    typeLabel: fixture.typeLabel,
    parentLabel: fixture.parentLabel,
    subtitle: fixture.subtitle,
    startDate: fixture.startDate,
    endDate: fixture.endDate,
    notes: fixture.notes,
    tags: fixture.tags,
  }
}

async function seed() {
  validateFixtures(RECORD_FIXTURES)

  if (process.argv.includes('--dry-run')) {
    console.log(`[dry-run] visual QA account: ${VISUAL_QA_EMAIL}`)
    console.log(`[dry-run] validated ${RECORD_FIXTURES.length} dated records`)
    console.log(`[dry-run] places: ${RECORD_FIXTURES.map(record => record.placeId).join(', ')}`)
    return
  }

  loadServerEnvFile()

  const [{ PrismaClient }, argon2] = await Promise.all([
    import('@prisma/client'),
    import('argon2'),
  ])
  const prisma = new PrismaClient()

  try {
    const passwordHash = await argon2.hash(VISUAL_QA_PASSWORD)
    const user = await prisma.user.upsert({
      where: { email: VISUAL_QA_EMAIL },
      create: {
        email: VISUAL_QA_EMAIL,
        username: VISUAL_QA_USERNAME,
        passwordHash,
      },
      update: {
        username: VISUAL_QA_USERNAME,
        passwordHash,
      },
    })

    const deleted = await prisma.userTravelRecord.deleteMany({
      where: {
        user: {
          email: VISUAL_QA_EMAIL,
        },
      },
    })

    await prisma.userTravelRecord.createMany({
      data: RECORD_FIXTURES.map(fixture => toUserTravelRecordCreateInput(user.id, fixture)),
    })

    console.log(`Seeded visual QA account: ${VISUAL_QA_EMAIL}`)
    console.log(`Deleted existing records for target account: ${deleted.count}`)
    console.log(`Created records: ${RECORD_FIXTURES.length}`)
    console.log(`Places: ${RECORD_FIXTURES.map(record => record.placeId).join(', ')}`)
  }
  finally {
    await prisma.$disconnect()
  }
}

seed().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
