// Simple seed: run scraper once (can extend later)
require("dotenv").config()
const { scrapeAndStore } = require("../dist/lib/scrape")
;(async () => {
	try {
		const res = await scrapeAndStore()
		console.log("Seed complete", res)
	} catch (e) {
		console.error("Seed failed", e)
		process.exit(1)
	}
})()
