import { useState, useContext, useEffect, createContext } from 'react'
import axios from 'axios'
import { getWeek, getNextOpp, getTeamStatData } from '../logic/logic'

export const DataContext = createContext()

export const DataProvider = ({ children }) => {
  const [teamName, setTeamName] = useState('')
  const [currentData, setCurrentData] = useState({ team1: {}, team2: {} })
  const [opp, setOpp] = useState('')

  const cache = {}
  const week = getWeek()

  const handleGetAllData = async () => {
    if (teamName) {
      const tempOpp = await getNextOpp()
      console.log('Opp is : ', tempOpp)
      setOpp(tempOpp)
      currentData.team1 = await getTeamStatData(teamName)
      // currentData.team2 = await getTeamStatData(opp)}
    }
    console.log('no team name ')
  }

  return (
    <DataContext.Provider
      value={{ handleGetAllData, teamName, setTeamName, currentData, opp }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useDataContext = () => {
  return useContext(DataContext)
}
