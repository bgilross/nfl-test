import { useDataContext } from '../context/dataContext'
import TeamTable from './TeamTable'
import TeamRankingsDisplay from './TeamRankingsDisplay'

const Main = () => {
  const { teamName, setTeamName, opp, currentData, handleGetAllData } =
    useDataContext()

  const handleButton = () => {
    handleGetAllData()
  }

  return (
    <div>
      <div>
        <input
          type="text"
          value={teamName}
          onChange={(e) => {
            setTeamName(e.target.value)
          }}
        />
        <button onClick={handleButton}>Enter</button>
      </div>
      <div>
        <button
          onClick={() => {
            console.log(currentData)
          }}
        >
          Check
        </button>
      </div>
      <TeamRankingsDisplay currentData={currentData} />
      <div
        style={{
          width: '100%',
          padding: '10px',
          margin: '10px',
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        <TeamTable data={currentData} teamNum={'team1'} />
        <TeamTable data={currentData} teamNum={'team2'} />
      </div>
    </div>
  )
}
export default Main
