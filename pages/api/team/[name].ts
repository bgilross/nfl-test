import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../lib/prisma"

const normalize = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9 ]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { name } = req.query
	if (typeof name !== "string")
		return res.status(400).json({ error: "Invalid name" })

	const queryName = name.trim()
	const q = normalize(queryName)

	// Load all teams and score candidates using heuristics so frontend's
	// derived names (e.g. "Philadelphia Eagles", "Los Angeles Rams", "LA Rams")
	// resolve to the DB's stored team.name values like "Philadelphia" or "LA Rams".
	const allTeams = await prisma.team.findMany()

	let best = null
	let bestScore = 0

	const qTokens = q.split(" ").filter(Boolean)
	for (const t of allTeams) {
		const tn = normalize(t.name)
		let score = 0

		if (tn === q) score += 100
		if (tn.includes(q)) score += 50
		if (q.includes(tn) && tn.length > 0) score += 60

		// shared token overlap (e.g. 'rams' in both)
		const tTokens = tn.split(" ").filter(Boolean)
		for (const tok of tTokens) {
			if (qTokens.includes(tok)) score += 10
		}

		// last-token heuristic: often nicknames are last word
		const lastQ = qTokens[qTokens.length - 1]
		const lastT = tTokens[tTokens.length - 1]
		if (lastQ && lastT && lastQ === lastT) score += 20

		if (score > bestScore) {
			bestScore = score
			best = t
		}
	}

	if (!best || bestScore === 0) {
		// Return scored candidates for debugging so we can see why a name failed to match
		const qTokens = q.split(" ").filter(Boolean)
		const scored = allTeams
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
				return { team: t.name, tn, score }
			})
			.sort((a, b) => b.score - a.score)
		return res
			.status(404)
			.json({
				error: "Not found",
				query: queryName,
				scored: scored.slice(0, 8),
			})
	}

	const team = best

	const snapshots = await prisma.statSnapshot.findMany({
		where: { teamId: team.id },
		orderBy: { createdAt: "desc" },
		take: 100,
		include: { category: true },
	})
	if (String(req.query.debug) === "1") {
		return res
			.status(200)
			.json({ team, bestScore, snapshotCount: snapshots.length, snapshots })
	}
	res.status(200).json({ team, snapshots })
}
