import type { VercelRequest, VercelResponse } from "@vercel/node"
import { prisma } from "../../lib/prisma"

const normalize = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9 ]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const { name } = req.query
	const str = Array.isArray(name) ? name[0] : name
	if (typeof str !== "string" || !str.trim())
		return res.status(400).json({ error: "Invalid name" })

	const queryName = str.trim()
	const q = normalize(queryName)

	const allTeams = await prisma.team.findMany()
	let best: { id: number; name: string } | null = null
	let bestScore = 0
	const qTokens = q.split(" ").filter(Boolean)

	for (const t of allTeams) {
		const tn = normalize(t.name)
		let score = 0
		if (tn === q) score += 100
		if (tn.includes(q)) score += 50
		if (q.includes(tn) && tn.length > 0) score += 60
		const tTokens = tn.split(" ").filter(Boolean)
		for (const tok of tTokens) if (qTokens.includes(tok)) score += 10
		const lastQ = qTokens[qTokens.length - 1]
		const lastT = tTokens[tTokens.length - 1]
		if (lastQ && lastT && lastQ === lastT) score += 20
		if (score > bestScore) {
			bestScore = score
			best = { id: t.id, name: t.name }
		}
	}

	if (!best || bestScore === 0)
		return res.status(404).json({ error: "Not found" })

	const snapshots = await prisma.statSnapshot.findMany({
		where: { teamId: best.id },
		orderBy: { createdAt: "desc" },
		take: 100,
		include: { category: true },
	})
	return res.status(200).json({ team: best, snapshots })
}
