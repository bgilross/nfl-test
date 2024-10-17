import { getTeamRankings } from '../logic/logic'

const TeamRankings = ({ data }) => {
  const stats = getTeamRankings(data)
  console.log('data: ', data)

  return (
    <div style={{ fontSize: '.75rem' }}>
      <ul style={{ display: 'flex', padding: '3px', listStyleType: 'none' }}>
        <li>
          <h4>{data.TeamStats}</h4>
        </li>
        {Object.entries(stats).map(([category, data]) => (
          <li key={category} style={{ margin: '1px' }}>
            <h5>{category}</h5>
            <ul>
              {Object.entries(data).map(([key, value]) =>
                key !== 'Team' && key !== '2023' ? ( // Exclude "Team" and "Rank" from display
                  <li key={key} style={{ textWrap: 'nowrap' }}>
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
