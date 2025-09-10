import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const hasDatabaseUrl = !!process.env.DATABASE_URL
  const hasDirectUrl = !!process.env.DIRECT_URL
  const nodeEnv = process.env.NODE_ENV
  res.json({ ok: true, hasDatabaseUrl, hasDirectUrl, nodeEnv })
}
