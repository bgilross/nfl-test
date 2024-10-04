import stats from '../data/modified_data_with_team_names.json'
import TeamStatsDisplay from './TeamStatsDisplay'

const TeamStats = ({ teamName1, teamName2 }) => {
  const handleCheckData = () => {}

  return (
    <div>
      TeamStats
      <button onClick={handleCheckData}>Check Data</button>
      <TeamStatsDisplay teamName={teamName1} />
      <TeamStatsDisplay teamName={teamName2} />
    </div>
  )
}
export default TeamStats
