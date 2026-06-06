import { PrismaClient } from '@prisma/client'

const appEnv = process.env.APP_ENV?.toLowerCase()
const localUrl = process.env.DATABASE_URL_LOCAL
const productionUrl = process.env.DATABASE_URL_PRODUCTION

if (appEnv === 'production' && productionUrl) {
  process.env.DATABASE_URL = productionUrl
} else if (appEnv === 'local' && localUrl) {
  process.env.DATABASE_URL = localUrl
}

const prismaClientSingleton = (): PrismaClient => {
  const enableQueryLog =
    process.env.PRISMA_LOG_QUERIES === '1' ||
    process.env.PRISMA_LOG_QUERIES?.toLowerCase() === 'true'

  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? enableQueryLog
          ? ['query', 'error', 'warn']
          : ['error', 'warn']
        : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    const engineName = (prisma as any)?._engine?.constructor?.name as string | undefined
    const url = process.env.DATABASE_URL ?? ''
    const isPrismaProtocol = url.startsWith('prisma://') || url.startsWith('prisma+postgres://')

    if (engineName === 'DataProxyEngine' && url && !isPrismaProtocol) {
      throw new Error(
        [
          'Prisma Client is running in Data Proxy engine mode, but DATABASE_URL is not a prisma:// URL.',
          'This commonly happens after running `npx prisma generate --no-engine` (engine=none).',
          '',
          'Fix:',
          '  1) Run: npx prisma generate',
          '  2) Restart the dev server',
        ].join('\n'),
      )
    }
  }

  return prisma
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma