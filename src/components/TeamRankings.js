import PaperContainer from './PaperContainer'
import teamRankings from '../data/teamrankings_stats.json'
import GridBox from './GridBox'

const TeamRankings = ({ team1Name, team2Name }) => {
  const teamLegend = {
    Panthers: { teamLocation: 'Carolina' },
    Bears: { teamLocation: 'Chicago' },
  }
  const getTeamStats = (teamName) => {
    let stats = {}
    for (const category in teamRankings) {
      const teamData = teamRankings[category].find(
        (team) => team.Team === teamLegend[teamName].teamLocation
      )
      if (teamData) {
        stats[category] = teamData // Add the found team data to result
      }
    }

    return (
      <div>
        <ul style={{ display: 'flex', padding: '3px' }}>
          <li>
            <h4>{teamName}</h4>
          </li>
          {Object.entries(stats).map(([category, data]) => (
            <li key={category} style={{ margin: '10px' }}>
              <h3>{category}</h3>
              <ul>
                {Object.entries(data).map(([key, value]) =>
                  key !== 'Team' && key !== '2023' ? ( // Exclude "Team" and "Rank" from display
                    <li key={key}>
                      {key}: {value}
                    </li>
                  ) : null
                )}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return (
    <PaperContainer>
      <GridBox>
        <div>{getTeamStats(team1Name)}</div>
        <div>{getTeamStats(team2Name)}</div>
      </GridBox>
    </PaperContainer>
  )
}
export default TeamRankings
