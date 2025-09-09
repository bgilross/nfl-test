import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const teams = await prisma.team.findMany({ orderBy: { name: 'asc' } });
  res.status(200).json(teams);
}
