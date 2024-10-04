import stats from '../data/modified_data_with_team_names.json'
import Grid from '@mui/material/Grid2'
import PaperContainer from './PaperContainer'

const TeamStatsDisplay = ({ teamName }) => {
  const teamData = stats.find((team) =>
    team.team_name.toLowerCase().includes(teamName.toLowerCase())
  )

  const searchTerms = {
    search: {
      categories: {
        passing: [
          'completionPct',
          'ESPNQBRating',
          'QBRating',
          'netPassingYardsPerGame',
        ],
        receiving: ['ESPNWRRating', 'receivingYardsAfterCatch'],
        rushing: ['rushingYardsPerGame', 'longRushing'],
        defensive: [],
      },
    },
    ignore: ['teamGamesPlayed', 'totalYardsFromScrimmage', 'twoPoint'],
  }

  const teamCategories = teamData?.splits?.categories

  return (
    <div>
      <PaperContainer>
        <h2>Team1: {teamData?.team_name}</h2>
        {teamCategories?.map((category, catIndex) => {
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
      </PaperContainer>
    </div>
  )
}
export default TeamStatsDisplay
