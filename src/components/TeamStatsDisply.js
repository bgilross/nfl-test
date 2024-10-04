const TeamStatsDisply = () => {
  return (
    <div>
      <h2>Team1: {team1Data.team_name}</h2>
      {team1Categories?.map((category, catIndex) => {
        const categoryName = category.name
        if (!searchTerms.search.categories[categoryName]) {
          return null
        }
        const rankedStats = category.stats.filter(
          (stat) => (stat.rank <= 6 || stat.rank >= 27) && stat.value > 0
        )
        if (rankedStats.length === 0) return null
        return (
          <div key={catIndex}>
            <h3>{category.displayName}</h3>
            <div style={{ padding: '2px' }}>
              {rankedStats.map((stat, statIndex) => (
                <div key={statIndex} style={{ margin: '2px' }}>
                  <div>
                    {stat.rankDisplayValue}
                    {'  '}
                    {stat.displayName}
                    {'  '}
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default TeamStatsDisply
