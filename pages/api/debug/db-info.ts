import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const [teams, categories, snapshots] = await Promise.all([
      prisma.team.count(),
      prisma.category.count(),
      prisma.statSnapshot.count(),
    ])
    const recentCats = await prisma.category.findMany({ take: 5, orderBy: { id: 'asc' } })
    res.json({
      ok: true,
      counts: { teams, categories, snapshots },
      sampleCategories: recentCats,
      dbUrlHost: process.env.DATABASE_URL ? safeHost(process.env.DATABASE_URL) : null,
    })
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message })
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