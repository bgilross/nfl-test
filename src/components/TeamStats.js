
import stats from '../data/modified_data_with_team_names.json'

const TeamStats = ({ teamName1, teamName2 }) => {
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
  }

  const team1Data = stats.find((team) =>
    team.team_name.toLowerCase().includes(teamName1.toLowerCase())
  )
  const team2Data = stats.find((team) =>
    team.team_name.toLowerCase().includes(teamName2.toLowerCase())
  )

  const team1Categories = team1Data?.splits?.categories

  const displayTeamData = (teamData) => {

  }

  const handleCheckData = () => {
    console.log(team1Data)
  }
  if (!team1Data) {
    return <div>loading...</div>
  }
  return (
    <div>
      TeamStats
      <button onClick={handleCheckData}>Check Data</button>
      
    </div>
  )
}
export default TeamStats
