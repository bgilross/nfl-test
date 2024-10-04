import GridBox from './GridBox'
import TeamStatsDisplay from './TeamStatsDisplay'

const TeamStats = ({ teamName1, teamName2 }) => {
  const handleCheckData = () => {}

  return (
    <div>
      TeamStats
      <button onClick={handleCheckData}>Check Data</button>
      <GridBox>
        <TeamStatsDisplay teamName={teamName1} />
        <TeamStatsDisplay teamName={teamName2} />
      </GridBox>
    </div>
  )
}
export default TeamStats
