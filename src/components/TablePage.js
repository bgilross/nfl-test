import React, { useState, useEffect } from 'react'
import axios from 'axios'
import PlayerTable from './PlayerTable'

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

  const createData = () => {
    console.log('Running Create Data')

    let tempPlayersStats = []
    //loop through each player on the player list
    playerList.forEach((player) => {
      let playerStats = { name: player }
      console.log('Play Loop running, Player: ', player)

      allData.forEach((item) => {
        const boxScore = item.data.gamepackageJSON.boxscore.players
        const header = item.data.gamepackageJSON.header

        boxScore?.forEach((team, i) => {
          console.log('Processing Team Data: ', team, i)
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
              console.log('Found Player running: ', foundPlayer)
              const weekIndex = item.data.gamepackageJSON.header.week - 1

              if (!playerStats[statCategory.name]) {
                playerStats[statCategory.name] = {}

                statCategory.descriptions.forEach((desc) => {
                  playerStats[statCategory.name][desc] = new Array(
                    numWeeks
                  ).fill(0)
                })
              }

              foundPlayer.stats.forEach((statValue, index) => {
                console.log('stat value: ', statValue)
                const description = statCategory.descriptions[index]
                playerStats[statCategory.name][description][weekIndex] =
                  statValue
              })
            }
          })
        })
      })
      tempPlayersStats.push(playerStats)
      console.log('TempPlayerStats: ', tempPlayersStats)
      console.log('PlayerStats: ', playerStats)
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
    <div>
      <h1>Table Page</h1>
      <h2>{playerList}</h2>
      <h2>
        {playersStats.map((player, i) => (
          <div key={i}>Name: {player.name}</div>
        ))}
      </h2>

      {playersStats.map((player, i) => (
        <PlayerTable
          key={i}
          player={player}
          setPlayerList={setPlayerList}
          allData={allData}
        />
      ))}
    </div>
  )
}
export default TablePage
