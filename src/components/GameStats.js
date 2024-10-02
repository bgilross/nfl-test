import React, { useState, useEffect } from 'react'
import axios from 'axios'
import PlayerStats from './PlayerStats'

const GameStats = ({ gameID, playerList }) => {
  const [boxScore, setBoxScore] = useState(null)
  const [gamePackage, setGamePackage] = useState(null)
  const [loading, setLoading] = useState(true)

  const apiUrl = `https://cdn.espn.com/core/nfl/boxscore?xhr=1&gameId=${gameID}`

  const fetchBoxScore = async () => {
    setLoading(true)
    try {
      const response = await axios.get(apiUrl)
      setBoxScore(response.data.gamepackageJSON.boxscore)
      setGamePackage(response.data.gamepackageJSON)
      //   console.log(response.data.gamepackageJSON.header)
      setLoading(false)
    } catch (err) {
      console.log('Catch error: ', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBoxScore()
  }, [gameID])

  // Helper function to get team data
  const getCompetitorData = (competitor) => ({
    name: competitor.team.displayName,
    abbreviation: competitor.team.abbreviation,
    score: competitor.score,
    homeAway: competitor.homeAway,
    winner: competitor.winner ? 'Winner' : '',
  })

  if (loading) return <div>Loading...</div>

  if (!gamePackage || !gamePackage.header)
    return <div>No game data available</div> // Check if gamePackage is null

  return (
    <div>
      {/* Display Game Details */}
      {gamePackage.header && gamePackage.header.competitions && (
        <div>
          <h2>Game Details</h2>
          {gamePackage.header.competitions.map((competition, index) => {
            const homeTeam = getCompetitorData(
              competition.competitors.find((c) => c.homeAway === 'home')
            )
            const awayTeam = getCompetitorData(
              competition.competitors.find((c) => c.homeAway === 'away')
            )

            return (
              <div key={index}>
                <h3>
                  {awayTeam.name} vs. {homeTeam.name}
                </h3>
                <p>
                  {awayTeam.name} ({awayTeam.abbreviation}) - Score:{' '}
                  {awayTeam.score} {awayTeam.winner}
                </p>
                <p>
                  {homeTeam.name} ({homeTeam.abbreviation}) - Score:{' '}
                  {homeTeam.score} {homeTeam.winner}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Display Player Stats */}
      <div>
        {playerList && playerList.length > 0 ? (
          playerList.map((player, index) => {
            return (
              <PlayerStats key={index} player={player} boxScore={boxScore} />
            )
          })
        ) : (
          <p>No players available.</p>
        )}
      </div>
    </div>
  )
}

export default GameStats
