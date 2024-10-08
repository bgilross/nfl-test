import TeamStats from './TeamStats'

const TeamStatsDisplay = ({ currentData }) => {
  return (
    <div>
      <TeamStats data={currentData.team1} />
      <TeamStats data={currentData.team2} />
    </div>
  )
}
export default TeamStatsDisplay
