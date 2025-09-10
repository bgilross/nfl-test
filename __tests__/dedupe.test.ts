import { shouldInsertSnapshot, ParsedRow } from "../lib/scrape"

describe("shouldInsertSnapshot", () => {
	it("inserts when no recent", () => {
		const row: ParsedRow = { team: "X", valueCurrent: 10, rank: 1 }
		expect(shouldInsertSnapshot(null, row)).toBe(true)
	})
	it("skips identical", () => {
		const row: ParsedRow = { team: "X", valueCurrent: 10, rank: 2 }
		expect(shouldInsertSnapshot({ valueCurrent: 10, rank: 2 }, row)).toBe(false)
	})
	it("inserts if value differs", () => {
		const row: ParsedRow = { team: "X", valueCurrent: 11, rank: 2 }
		expect(shouldInsertSnapshot({ valueCurrent: 10, rank: 2 }, row)).toBe(true)
	})
	it("inserts if rank differs", () => {
		const row: ParsedRow = { team: "X", valueCurrent: 10, rank: 3 }
		expect(shouldInsertSnapshot({ valueCurrent: 10, rank: 2 }, row)).toBe(true)
	})
})
