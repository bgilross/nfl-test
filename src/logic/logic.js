import teamLegend from "../data/team_legend.json"
import axios from "axios"

// Axios instance with sane timeout for ESPN endpoints
const http = axios.create({ timeout: 10000 })

// Utility: simple delay (optional future throttling)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const toCandidates = (locationName, displayName) => {
	const cands = []
	if (locationName) cands.push(locationName)
	if (displayName) cands.push(displayName)
	if (displayName) {
		const parts = displayName.split(" ")
		const nick = parts[parts.length - 1]
		if (displayName.startsWith("Los Angeles")) {
			cands.push(`LA ${nick}`)
		}
		if (displayName.startsWith("New York")) {
			cands.push(`NY ${nick}`)
		}
	}
	return Array.from(new Set(cands))
}

export const getBackendTeamAggregate = async (locationName, displayName) => {
	// Hits Next.js API route /api/team/[name]
	const candidates = toCandidates(locationName, displayName)
	for (const name of candidates) {
		try {
			const res = await fetch(`/api/team/${encodeURIComponent(name)}`)
			if (!res.ok) continue
			const data = await res.json()
			if (!data?.snapshots) continue
			// Transform snapshots to categories map expected by UI (snake_case fields)
			const categories = {}
			for (const snap of data.snapshots) {
				const key = snap.category?.name || snap.category?.slug || "unknown"
				if (!categories[key]) categories[key] = {}
				// Preserve most recent only (snapshots assumed ordered desc from API)
				if (!categories[key].current_year) {
					categories[key] = {
						current_year: snap.currentYear ?? null,
						prev_year: snap.prevYear ?? null,
						value_current: snap.valueCurrent ?? null,
						value_prev: snap.valuePrev ?? null,
						last_1: snap.last1 ?? null,
						last_3: snap.last3 ?? null,
						home: snap.home ?? null,
						away: snap.away ?? null,
					}
				}
			}
			return { team: data.team, categories }
		} catch (_) {
			// try next candidate
		}
	}
	return null
}

// const cache = {}

export const getSeasonYear = (date = new Date()) => {
	// NFL season labeled by fall year; Jan–Aug belong to previous season
	const month = date.getMonth() // 0=Jan .. 8=Sep
	const year = date.getFullYear()
	return month >= 8 ? year : year - 1
}

const firstThursdayOfSeptember = (seasonYear) => {
	const d = new Date(seasonYear, 8, 1) // Sep 1
	const day = d.getDay() // 0=Sun..6=Sat
	const offsetToThu = (4 - day + 7) % 7
	d.setDate(d.getDate() + offsetToThu)
	return d
}

export const getWeek = (seasonYear = getSeasonYear(), now = new Date()) => {
	const start = firstThursdayOfSeptember(seasonYear)
	const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24))
	const week = Math.ceil(diffDays / 7)
	if (seasonYear < getSeasonYear(now)) return 18 // past season assumed complete
	if (week < 1) return 1
	if (week > 18) return 18
	return week
}

// Removed getLastWord (no longer needed for static JSON name matching)

// Legacy getTeamRankings removed; backend now authoritative.

// removed global week; use getWeek(seasonYear) where needed

const getTeamID = (teamName) => {
	for (const [id, name] of Object.entries(teamLegend)) {
		if (name.toLowerCase().includes(teamName?.toLowerCase())) {
			return id
		}
	}

	return null
}

export const getNextGameID = async (teamName) => {
	const teamID = getTeamID(teamName)
	if (!teamID) return null
	const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamID}`
	try {
		const response = await http.get(apiUrl)
		return response.data.team.nextEvent?.[0]?.id || null
	} catch (e) {
		return null
	}
}

export const getNextOpp = async (teamName, seasonYear = getSeasonYear()) => {
	// nextEvent only applies to current season
	if (seasonYear !== getSeasonYear()) return null
	const nextGameID = await getNextGameID(teamName)
	if (!nextGameID) {
		return null
	}
	const apiUrl = `https://cdn.espn.com/core/nfl/game?xhr=1&gameId=${nextGameID}`
	try {
		const response = await http.get(apiUrl)
		const team1 =
			response.data.gamepackageJSON.boxscore.teams[0].team.displayName

		const team2 =
			response.data.gamepackageJSON.boxscore.teams[1].team.displayName

		if (team1.toLowerCase().includes(teamName.toLowerCase())) {
			return team2
		} else if (team2.toLowerCase().includes(teamName.toLowerCase())) {
			return team1
		} else {
			return null
		}
	} catch (error) {
		console.error("Error fetching data:", error)
		return null
	}
}

export const getTeamStatData = async (
	teamName,
	seasonYear = getSeasonYear()
) => {
	let allStats = {
		team: teamName,
		location: "",
		teamData: {},
		gamesData: [],
		categories: {},
	}
	const gameData = await getPrevGameData(teamName, seasonYear)
	if (!gameData || !Array.isArray(gameData) || gameData.length === 0) {
		console.error("No valid game data found.")
		return allStats
	}
	try {
		const competitors =
			gameData[0]?.data?.gamepackageJSON?.header?.competitions?.[0]
				?.competitors || []
		competitors.forEach((team) => {
			if (
				team.team.displayName.toLowerCase().includes(teamName.toLowerCase())
			) {
				allStats.location = team.team.location
				allStats.teamData = team.team
			}
		})
	} catch (e) {
		console.error("Error extracting team meta", e)
	}

	for (const game of gameData) {
		if (game.data && game.data.gamepackageJSON) {
			const boxScore = game.data.gamepackageJSON.boxscore.players
			const header = game.data.gamepackageJSON.header

			const homeTeam = header.competitions[0].competitors.find(
				(team) => team.homeAway === "home"
			)
			const awayTeam = header.competitions[0].competitors.find(
				(team) => team.homeAway === "away"
			)
			if (boxScore) {
				for (const team of boxScore) {
					if (
						team.team.displayName.toLowerCase().includes(teamName.toLowerCase())
					) {
						for (const statCategory of team.statistics) {
							if (
								["passing", "rushing", "receiving", "defensive"].includes(
									statCategory.name.toLowerCase()
								)
							) {
								const weekIndex = (header.week || 1) - 1
								if (!allStats.categories[statCategory.name]) {
									allStats.categories[statCategory.name] = {}
								}

								for (const player of statCategory.athletes) {
									if (
										!allStats.categories[statCategory.name][
											player.athlete.displayName
										]
									) {
										allStats.categories[statCategory.name][
											player.athlete.displayName
										] = {}
									}
									for (const [i, stat] of player.stats.entries()) {
										const description = statCategory.descriptions[i]

										if (
											!allStats.categories[statCategory.name][
												player.athlete.displayName
											][description]
										) {
											// Ensure we size array to the current known week number so indexes map cleanly
											allStats.categories[statCategory.name][
												player.athlete.displayName
											][description] = Array(getWeek(seasonYear)).fill(0)
										}
										allStats.categories[statCategory.name][
											player.athlete.displayName
										][description][weekIndex] = stat
									}
								}
							}
						}
					}
				}
			}

			allStats.gamesData.push({
				week: header.week,
				date: header.competitions[0].date,
				boxScore: boxScore,

				homeTeam: {
					name: homeTeam.team.displayName,
					abbreviation: homeTeam.team.abbreviation,
					score: homeTeam.score,
					result: homeTeam.winner ? "W" : "L",
					location: homeTeam.team.location,
					teamData: homeTeam.team,
				},
				awayTeam: {
					name: awayTeam.team.displayName,
					abbreviation: awayTeam.team.abbreviation,
					score: awayTeam.score,
					result: awayTeam.winner ? "W" : "L",
					location: awayTeam.team.location,
					teamData: awayTeam.team,
				},
			})
		}
	}

	return allStats
}

const getPrevGameData = async (teamName, seasonYear = getSeasonYear()) => {
	const apiUrl = `https://cdn.espn.com/core/nfl/boxscore?xhr=1&gameId=`
	const gameIds = await getAllTeamsGameIds(teamName, seasonYear)
	if (!gameIds.length) return []
	try {
		const responses = await Promise.all(
			gameIds.map((gameId) => http.get(`${apiUrl}${gameId}`))
		)
		return responses
	} catch (_) {
		return []
	}
}

const getTeamsGameIdByWeek = async (
	teamName,
	week,
	seasonYear = getSeasonYear()
) => {
	const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${seasonYear}&seasontype=2&week=${week}`
	try {
		const response = await http.get(apiUrl)
		const events = response.data.events || []
		if (!events.length) return null
		const teamGame = events.find((e) =>
			e.name.toLowerCase().includes(teamName.toLowerCase())
		)
		return teamGame ? teamGame.id : null
	} catch (_) {
		return null
	}
}

const getAllTeamsGameIds = async (teamName, seasonYear = getSeasonYear()) => {
	const nowSeason = getSeasonYear()
	const currentWeek = seasonYear < nowSeason ? 18 : getWeek(seasonYear)
	const weeks = Array.from({ length: currentWeek }, (_, i) => i + 1)
	const results = await Promise.all(
		weeks.map((w) => getTeamsGameIdByWeek(teamName, w, seasonYear))
	)
	return results.filter(Boolean)
}
