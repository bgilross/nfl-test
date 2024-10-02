import { useEffect, useState } from 'react'

const PlayerStats = ({ boxScore, player }) => {
  const [playerStats, setPlayerStats] = useState([])

  // Helper function to find and map the player's stats
  const findPlayerStats = () => {
    if (!boxScore || !boxScore.players) return []

    return boxScore.players.flatMap((team) =>
      team.statistics
        .map((statCategory) => {
          const foundPlayer = statCategory.athletes.find(
            (athlete) =>
              athlete.athlete.displayName.toLowerCase() === player.toLowerCase()
          )

          if (foundPlayer && foundPlayer.stats) {
            return {
              category: statCategory.name,
              keys: statCategory.keys || [],
              stats: foundPlayer.stats || [],
              descriptions: statCategory.descriptions || [],
            }
          }
          return null
        })

        .filter(Boolean)
    )
  }

  useEffect(() => {
    if (boxScore) {
      const foundStats = findPlayerStats()
      console.log(foundStats)
      setPlayerStats(foundStats)
    }
  }, [boxScore, player])

  return (
    <div>
      {playerStats.length > 0 ? (
        <div>
          <h2>Stats for {player}</h2>
          {playerStats.map((stat, index) => (
            <div key={index}>
              <h3>{stat.category} Stats</h3>
              <ul>
                {stat.keys.length > 0 && stat.stats.length > 0 ? (
                  stat.keys.map((key, keyIndex) => (
                    <li key={keyIndex}>
                      {stat.descriptions[keyIndex] || key}:{' '}
                      {stat.stats[keyIndex]}
                    </li>
                  ))
                ) : (
                  <li>No stats available for this category</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>No stats found for {player}</p>
      )}
    </div>
  )
}

export default PlayerStats
