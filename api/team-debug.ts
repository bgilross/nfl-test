import type { VercelRequest, VercelResponse } from "@vercel/node"
import { prisma } from "../lib/prisma"

const normalize = (s = "") =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9 ]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const name = String(req.query.name || "").trim()
	if (!name) return res.status(400).json({ error: "missing name" })
	const q = normalize(name)
	const teams = await prisma.team.findMany()
	let best: any = null
	let bestScore = 0
	const qTokens = q.split(" ").filter(Boolean)
	const scored = teams
		.map((t) => {
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
				best = t
			}
			return { team: t.name, tn, score }
		})
		.sort((a, b) => b.score - a.score)

	if (!best || bestScore === 0)
		return res
			.status(200)
			.json({ name, normalized: q, best: null, scored: scored.slice(0, 8) })
	const snapshots = await prisma.statSnapshot.findMany({
		where: { teamId: best.id },
		orderBy: { createdAt: "desc" },
		take: 100,
		include: { category: true },
	})
	return res
		.status(200)
		.json({
			name,
			normalized: q,
			best: { id: best.id, name: best.name, score: bestScore },
			snapshotCount: snapshots.length,
			snapshots,
			scored: scored.slice(0, 8),
		})
}
