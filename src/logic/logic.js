import teamLegend from '../data/team_legend.json'
import axios from 'axios'
import teamRankings from '../data/teamrankings_stats.json'

// const cache = {}

export const getWeek = () => {
  const startDate = new Date('2024-09-05')
  const currentDate = new Date()
  const differenceInTime = currentDate - startDate
  const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24))
  const currentWeek = Math.ceil(differenceInDays / 7)
  if (currentWeek < 1) {
    return "Season hasn't started yet"
  } else if (currentWeek > 17) {
    return 'Season has ended'
  } else {
    return currentWeek
  }
}

export const getTeamRankings = (teamLocation) => {
  let stats = {}
  for (const category in teamRankings) {
    const teamData = teamRankings[category].find(
      (team) => team.Team === teamLocation
    )
    if (teamData) {
      stats[category] = teamData
    }
  }
  return stats
}

const week = getWeek()

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
    console.error('Error: getTeamID returned null')
    return null
  }
  const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamID}`

  try {
    const response = await axios.get(apiUrl)

    const nextEventID = response.data.team.nextEvent[0].id
    console.log('Next event ID:', nextEventID)
    return nextEventID
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}

export const getNextOpp = async (teamName) => {
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
    console.error('Error fetching data:', error)
    return null
  }
}

export const getTeamStatData = async (teamName) => {
  let allStats = { team: teamName, location: '', gamesData: [], categories: {} }
  const gameData = await getPrevGameData(teamName)
  gameData[0].data.gamepackageJSON.header.competitions[0].competitors.forEach(
    (team) => {
      if (
        team.team.displayName.toLowerCase().includes(teamName.toLowerCase())
      ) {
        allStats.location = team.team.location
      }
    }
  )
  if (!gameData || !Array.isArray(gameData)) {
    console.error('No valid game data found.')
    return allStats // Return empty stats if no valid data
  }

  for (const game of gameData) {
    if (game.data && game.data.gamepackageJSON) {
      const boxScore = game.data.gamepackageJSON.boxscore.players
      const header = game.data.gamepackageJSON.header

      const homeTeam = header.competitions[0].competitors.find(
        (team) => team.homeAway === 'home'
      )
      const awayTeam = header.competitions[0].competitors.find(
        (team) => team.homeAway === 'away'
      )

      for (const team of boxScore) {
        if (
          team.team.displayName.toLowerCase().includes(teamName.toLowerCase())
        ) {
          for (const statCategory of team.statistics) {
            if (
              ['passing', 'rushing', 'receiving', 'defensive'].includes(
                statCategory.name.toLowerCase()
              )
            ) {
              const weekIndex = header.week - 1
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
                    allStats.categories[statCategory.name][
                      player.athlete.displayName
                    ][description] = Array(week).fill(0)
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
      allStats.gamesData.push({
        week: header.week,
        date: header.competitions[0].date,
        homeTeam: {
          name: homeTeam.team.displayName,
          abbreviation: homeTeam.team.abbreviation,
          score: homeTeam.score,
          result: homeTeam.winner ? 'W' : 'L',
        },
        awayTeam: {
          name: awayTeam.team.displayName,
          abbreviation: awayTeam.team.abbreviation,
          score: awayTeam.score,
          result: awayTeam.winner ? 'W' : 'L',
        },
      })
    }
  }

  console.log('finishing ...', allStats)
  return allStats
}

const getPrevGameData = async (teamName) => {
  const apiUrl = `https://cdn.espn.com/core/nfl/boxscore?xhr=1&gameId=`
  let gameDataPromises = []
  const gameIds = await getAllTeamsGameIds(teamName)

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
    console.log('get prev game data: responses: ', responses)
    return responses
  } catch (err) {
    console.log(err)
  }
}

const getTeamsGameIdByWeek = async (teamName, week) => {
  console.log(
    `Running getTeamsGameIdByWeek: teamName: ${teamName}, week: ${week}`
  )
  const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2024&seasontype=2&week=${week}`
  try {
    const response = await axios.get(apiUrl)
    console.log(response.data) // Log the entire response for inspection

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

    console.log('Found teamGame:', teamGame)
    return teamGame.id // Return the game ID
  } catch (err) {
    console.log(`Error fetching data for ${teamName} week: ${week}`, err)
    return null // Return null in case of error
  }
}

const getAllTeamsGameIds = async (teamName) => {
  console.log('getAllteamGamIds is running: ', teamName)
  let gameIds = []

  // Ensure the current week is fetched correctly
  const currentWeek = getWeek()

  // Iterate through the weeks and fetch game IDs
  for (let week = 1; week <= currentWeek; week++) {
    const gameId = await getTeamsGameIdByWeek(teamName, week)
    console.log('GetTeamsGamesIdByWeek: gameId: ', gameId) // Debugging output
    gameIds.push(gameId)
  }

  return gameIds.filter((id) => id !== null) // Filter out any null IDs
}
