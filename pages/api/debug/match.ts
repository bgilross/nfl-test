import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../lib/prisma"

const normalize = (s = "") =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9 ]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const q = String(req.query.q || "").trim()
	if (!q) return res.status(400).json({ error: "missing q" })
	const nq = normalize(q)
	const qTokens = nq.split(" ").filter(Boolean)
	const teams = await prisma.team.findMany()
	const scored = teams.map((t) => {
		const tn = normalize(t.name)
		let score = 0
		if (tn === nq) score += 100
		if (tn.includes(nq)) score += 50
		if (nq.includes(tn) && tn.length > 0) score += 60
		const tTokens = tn.split(" ").filter(Boolean)
		for (const tok of tTokens) if (qTokens.includes(tok)) score += 10
		const lastQ = qTokens[qTokens.length - 1]
		const lastT = tTokens[tTokens.length - 1]
		if (lastQ && lastT && lastQ === lastT) score += 20
		return { team: t.name, tn, score }
	})
	scored.sort((a, b) => b.score - a.score)
	res
		.status(200)
		.json({ query: q, normalized: nq, scored: scored.slice(0, 10) })
}
