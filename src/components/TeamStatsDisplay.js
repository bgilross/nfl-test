import TeamStats from './TeamStats'

const TeamStatsDisplay = ({ currentData }) => {
  return (
    <div style={{ display: 'flex' }}>
      <h2>vs {currentData.team2.team}</h2>
      <TeamStats data={currentData.team2} />
    </div>
  )
}
export default TeamStatsDisplay
