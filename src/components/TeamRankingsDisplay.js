import TeamRankings from './TeamRankings'

const TeamRankingsDisplay = ({ currentData }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <div>
        <h2>{currentData?.team1?.teamData?.displayName}</h2>
        <TeamRankings data={currentData.team1} />
      </div>
      <div>
        <h2>{currentData?.team2?.team}</h2>
        <TeamRankings data={currentData.team2} />
      </div>
    </div>
  )
}
export default TeamRankingsDisplay
