import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
	try {
		const teams = await prisma.team.findMany({ take: 1 })
		console.log("Team table exists. Count sample length:", teams.length)
	} catch (e: any) {
		console.error("Error querying Team table:", e.message)
	}
	try {
		const cats = await prisma.category.findMany({ take: 1 })
		console.log("Category table exists. Count sample length:", cats.length)
	} catch (e: any) {
		console.error("Error querying Category table:", e.message)
	}
	try {
		const snaps = await prisma.statSnapshot.findMany({ take: 1 })
		console.log("StatSnapshot table exists. Count sample length:", snaps.length)
	} catch (e: any) {
		console.error("Error querying StatSnapshot table:", e.message)
	}
	await prisma.$disconnect()
}

main()
