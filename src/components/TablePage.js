import React, { useState, useEffect } from 'react'
import axios from 'axios'
import PlayerTable from './PlayerTable'
import Grid from '@mui/material/Grid2'
import GridBox from './GridBox'

const TablePage = ({ gameIDs, playerList, setPlayerList }) => {
  const [allData, setAllData] = useState([])
  const [loading, setLoading] = useState(true)
  const [playersStats, setPlayersStats] = useState([])
  const [gameResults, setGameResults] = useState([])

  const apiUrl = `https://cdn.espn.com/core/nfl/boxscore?xhr=1&gameId=`
  let numWeeks = 4
  const fetchAllGameData = async () => {
    setLoading(true)
    try {
      const gameDataPromises = gameIDs.map((gameID) =>
        axios.get(`${apiUrl}${gameID}`)
      )
      const responses = await Promise.all(gameDataPromises)
      setAllData(responses)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const extractGameInfo = (header) => {
    const weekNumber = header.week
    const competition = header.competitions[0]
    const gameDate = competition.date

    const teams = competition.competitors.map((team) => {
      return {
        teamName: team.team.displayName,
        homeAway: team.homeAway,
        score: team.score,
        winner: team.winner ? 'W' : 'L',
        abbreviation: team.team.abbreviation,
      }
    })

    const homeTeam = teams.find((team) => team.homeAway === 'home')
    const awayTeam = teams.find((team) => team.homeAway === 'away')

    return {
      week: weekNumber,
      date: gameDate,
      homeTeam: {
        name: homeTeam.teamName,
        score: homeTeam.score,
        result: homeTeam.winner,
        abbreviation: homeTeam.abbreviation,
      },
      awayTeam: {
        name: awayTeam.teamName,
        score: awayTeam.score,
        result: awayTeam.winner,
        abbreviation: awayTeam.abbreviation,
      },
    }
  }

  const createData = () => {
    let tempPlayersStats = []
    let tempGamesData = []
    //loop through each player on the player list
    playerList.forEach((player) => {
      let playerStats = { name: player, gamesData: [], categories: {} }

      allData.forEach((item) => {
        const boxScore = item.data.gamepackageJSON.boxscore.players
        const header = item.data.gamepackageJSON.header

        const homeTeam = header.competitions[0].competitors.find(
          (team) => team.homeAway === 'home'
        )
        const awayTeam = header.competitions[0].competitors.find(
          (team) => team.homeAway === 'away'
        )

        let playerInGame = false

        boxScore?.forEach((team, i) => {
          team.statistics?.forEach((statCategory) => {
            const foundPlayer = statCategory.athletes.find(
              (athlete) =>
                athlete.athlete.displayName.toLowerCase() ===
                player.toLowerCase()
            )

            if (
              foundPlayer &&
              ['passing', 'rushing', 'receiving', 'fumbles'].includes(
                statCategory.name.toLowerCase()
              )
            ) {
              playerInGame = true
              const weekIndex = item.data.gamepackageJSON.header.week - 1

              if (!playerStats.categories[statCategory.name]) {
                playerStats.categories[statCategory.name] = {}

                statCategory.descriptions.forEach((desc) => {
                  playerStats.categories[statCategory.name][desc] = new Array(
                    numWeeks
                  ).fill(0)
                })
              }

              foundPlayer.stats.forEach((statValue, index) => {
                const description = statCategory.descriptions[index]
                playerStats.categories[statCategory.name][description][
                  weekIndex
                ] = statValue
              })
            }
          })
        })
        if (playerInGame) {
          playerStats.gamesData.push({
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
        console.log('PlayerStats got pushed: ', playerStats)
      })
      tempPlayersStats.push(playerStats)
    })
    setPlayersStats(tempPlayersStats)
  }

  useEffect(() => {
    fetchAllGameData()
  }, [gameIDs])

  useEffect(() => {
    if (allData.length > 0) {
      createData()
    }
  }, [allData, playerList])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <GridBox>
      {playersStats.map((player, i) => (
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
          <PlayerTable
            key={i}
            player={player}
            setPlayerList={setPlayerList}
            allData={allData}
          />
        </Grid>
      ))}
    </GridBox>
  )
}
export default TablePage
