import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const start = Date.now()
  try {
    const databaseUrlPresent = !!process.env.DATABASE_URL
    const directUrlPresent = !!process.env.DIRECT_URL
    const dbUrlHost = process.env.DATABASE_URL ? safeHost(process.env.DATABASE_URL) : null
    const [teams, categories, snapshots] = await Promise.all([
      prisma.team.count(),
      prisma.category.count(),
      prisma.statSnapshot.count(),
    ])
    const recentCats = await prisma.category.findMany({ take: 5, orderBy: { id: 'asc' } })
    res.json({
      ok: true,
      latencyMs: Date.now() - start,
      counts: { teams, categories, snapshots },
      sampleCategories: recentCats.map(c => ({ id: c.id, slug: c.slug })),
      env: { databaseUrlPresent, directUrlPresent, dbUrlHost },
      nodeEnv: process.env.NODE_ENV,
    })
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e.message,
      code: e.code,
      meta: e.meta || null,
      stack: process.env.NODE_ENV === 'development' ? e.stack : undefined,
      envPresence: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
      },
    })
  }
}

function safeHost(url: string) {
  try {
    const u = new URL(url)
    return u.host
  } catch {
    return 'invalid-url'
  }
}