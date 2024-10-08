import { useState } from 'react'
import PaperContainer from './PaperContainer'
import GridBox from './GridBox'
import Grid from '@mui/material/Grid2'
import { useDataContext } from '../context/dataContext'

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
    </div>
  )
}
export default Main
