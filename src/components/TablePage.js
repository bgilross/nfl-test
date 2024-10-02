import React, { useState, useEffect } from 'react'
import axios from 'axios'

const TablePage = ({ gameIDs, playerList }) => {
  const [allData, setAllData] = useState([])
  const [boxScores, setBoxScores] = useState([])
  const [scoreInfo, setScoreInfo] = useState([])
  const [loading, setLoading] = useState(true)
  const [playersScores, setPlayerStats] = useState([])

  const apiUrl = `https://cdn.espn.com/core/nfl/boxscore?xhr=1&gameId=`

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


  const createData = (allData, playerList) => {
    const boxScore = allData.data.gamepackageJSON.boxscore.players.statistics

    return playerList.map((player) => {
      let playerStats = { name: player }

      boxScore.map((statCategory) => {
        const foundPlayer = statCategory.athletes.find(
          (athlete) =>
            athlete.athlete.displayName.toLowerCase() === player.toLowerCase()
        )

        // If player is found and stats are available, push them into playerStats
        if (foundPlayer) {
                statCategory.descriptions.map((item) => {
                    playerStats.
                })



          playerStats.stats.push({
            category: statCategory.name,
            keys: statCategory.keys || [],
            stats: foundPlayer.stats || [],
            descriptions: statCategory.descriptions || [],
          })
        }

        return null // Returning null here as we are not using map's return
      })

      return playerStats // Return the player stats object
    })
  }

  useEffect(() => {
    fetchAllGameData()
  }, [gameIDs])

  return <div>TablePage</div>
}
export default TablePage
