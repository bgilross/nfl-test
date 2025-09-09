import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  if (typeof name !== 'string') return res.status(400).json({ error: 'Invalid name' });
  const team = await prisma.team.findUnique({ where: { name } });
  if (!team) return res.status(404).json({ error: 'Not found' });
  const snapshots = await prisma.statSnapshot.findMany({
    where: { teamId: team.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { category: true }
  });
  res.status(200).json({ team, snapshots });
}
