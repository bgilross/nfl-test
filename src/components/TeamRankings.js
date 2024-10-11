import { getTeamRankings } from '../logic/logic'

const TeamRankings = ({ data }) => {
  const stats = getTeamRankings(data)

  return (
    <div>
      <ul style={{ display: 'flex', padding: '3px' }}>
        <li>
          <h4>{data.TeamStats}</h4>
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
export default TeamRankings
