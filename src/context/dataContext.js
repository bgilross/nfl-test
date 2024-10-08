import { useState, useContext, useEffect, createContext } from 'react'
import axios, { all } from 'axios'
import { getWeek, getNextOpp, getTeamStatData } from '../logic/logic'
import teamLegend from '../data/team_legend.json'

export const DataContext = createContext()

export const DataProvider = ({ children }) => {
  const [teamName, setTeamName] = useState('')
  const [currentData, setCurrentData] = useState({ team1: {}, team2: {} })
  const [opp, setOpp] = useState('')

  const cache = {}

  const handleGetAllData = async () => {
    if (teamName) {
      const tempOpp = await getNextOpp(teamName)
      console.log('Opp is : ', tempOpp)
      setOpp(tempOpp)

      const [team1Data, team2Data] = await Promise.all([
        getTeamStatData(teamName),
        getTeamStatData(tempOpp),
      ])

      setCurrentData({ team1: team1Data, team2: team2Data })
    }
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
