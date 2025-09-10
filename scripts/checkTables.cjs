require("dotenv").config()
const { PrismaClient } = require("@prisma/client")
console.log("DATABASE_URL =", process.env.DATABASE_URL)
const prisma = new PrismaClient()
;(async () => {
	try {
		const teams = await prisma.team.findMany({ take: 1 })
		console.log("Team table query ok, rows:", teams.length)
	} catch (e) {
		console.error("Team table query failed:", e.message)
	}
	try {
		const cats = await prisma.category.findMany({ take: 1 })
		console.log("Category table query ok, rows:", cats.length)
	} catch (e) {
		console.error("Category table query failed:", e.message)
	}
	try {
		const snaps = await prisma.statSnapshot.findMany({ take: 1 })
		console.log("StatSnapshot table query ok, rows:", snaps.length)
	} catch (e) {
		console.error("StatSnapshot table query failed:", e.message)
	}
	await prisma.$disconnect()
})()
