import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../lib/prisma"

export default async function handler(
	_req: NextApiRequest,
	res: NextApiResponse
) {
	const categories = await prisma.category.findMany({
		orderBy: { slug: "asc" },
	})
	res.status(200).json(categories)
}
