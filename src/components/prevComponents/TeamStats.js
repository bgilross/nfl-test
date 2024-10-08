import GridBox from './GridBox'
import TeamStatsDisplay from './TeamStatsDisplay'

const TeamStats = ({ teamName1, teamName2 }) => {
  return (
    <div>
      <TeamStatsDisplay teamName={teamName1} />
      <TeamStatsDisplay teamName={teamName2} />
    </div>
  )
}
export default TeamStats
