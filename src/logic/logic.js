import teamLegend from "../data/team_legend.json"
import axios from "axios"
// Removed static teamRankings JSON dependency (migrated to backend-powered data)

const apiBase = process.env.REACT_APP_API_BASE || ""

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
	const candidates = toCandidates(locationName, displayName)
	for (const name of candidates) {
		try {
			const url = `${apiBase}/team/${encodeURIComponent(name)}`
			const res = await axios.get(url)
			return res.data
		} catch (e) {
			// try next candidate on 404/other errors
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

	if (!teamID) {
		console.error("Error: getTeamID returned null")
		return null
	}
	const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamID}`

	try {
		const response = await axios.get(apiUrl)

		const nextEventID = response.data.team.nextEvent[0].id
		return nextEventID
	} catch (error) {
		console.error("Error fetching data:", error)
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
		const response = await axios.get(apiUrl)
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
	let gameDataPromises = []
	const gameIds = await getAllTeamsGameIds(teamName, seasonYear)

	gameIds.forEach((gameId) => {
		gameDataPromises.push(
			axios.get(`${apiUrl}${gameId}`).then((response) => {
				// cache[gameId] = response
				return response
			})
		)
	})

	try {
		const responses = await Promise.all(gameDataPromises)
		return responses
	} catch (err) {
		console.log(err)
	}
}

const getTeamsGameIdByWeek = async (
	teamName,
	week,
	seasonYear = getSeasonYear()
) => {
	const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${seasonYear}&seasontype=2&week=${week}`
	try {
		const response = await axios.get(apiUrl)

		// Check if the events array is not empty
		if (!response.data.events || response.data.events.length === 0) {
			console.log(`No events found for week ${week}`)
			return null
		}

		// Convert team name to lowercase for case-insensitive comparison
		const teamGame = response.data.events.find((event) =>
			event.name.toLowerCase().includes(teamName.toLowerCase())
		)

		if (!teamGame) {
			console.log(`No game found for ${teamName} in week ${week}`)
			return null // Ensure we return null if not found
		}

		return teamGame.id // Return the game ID
	} catch (err) {
		console.log(`Error fetching data for ${teamName} week: ${week}`, err)
		return null // Return null in case of error
	}
}

const getAllTeamsGameIds = async (teamName, seasonYear = getSeasonYear()) => {
	let gameIds = []

	// For past seasons, fetch full 18 weeks; current season clamp to week number
	const nowSeason = getSeasonYear()
	const currentWeek = seasonYear < nowSeason ? 18 : getWeek(seasonYear)

	// Iterate through the weeks and fetch game IDs
	for (let week = 1; week <= currentWeek; week++) {
		const gameId = await getTeamsGameIdByWeek(teamName, week, seasonYear)
		gameIds.push(gameId)
	}

	return gameIds.filter((id) => id !== null) // Filter out any null IDs
}
