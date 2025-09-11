import type { VercelRequest, VercelResponse } from "@vercel/node"
import { prisma } from "../lib/prisma"

export default async function handler(
	_req: VercelRequest,
	res: VercelResponse
) {
	const teams = await prisma.team.findMany({ orderBy: { name: "asc" } })
	res.status(200).json(teams)
}
