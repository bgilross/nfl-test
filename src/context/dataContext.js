import { useState, useContext, createContext } from "react"
import { getNextOpp, getTeamStatData, getSeasonYear } from "../logic/logic"
import teamLegend from "../data/team_legend.json"

export const DataContext = createContext()

export const DataProvider = ({ children }) => {
	const [teamName, setTeamName] = useState("")
	const [currentData, setCurrentData] = useState({ team1: {}, team2: {} })
	const [opp, setOpp] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [selectedYear, setSelectedYear] = useState(getSeasonYear())

	const cache = {}

	const handleGetAllData = async () => {
		if (!teamName) return
		setLoading(true)
		setError(null)
		try {
			const tempOpp = await getNextOpp(teamName, selectedYear)
			setOpp(tempOpp || "")
			// For non-current seasons, opponent may be unavailable; don't hard fail.
			const [team1Data, team2Data] = await Promise.all([
				getTeamStatData(teamName, selectedYear),
				tempOpp ? getTeamStatData(tempOpp, selectedYear) : Promise.resolve({}),
			])
			setCurrentData({ team1: team1Data, team2: team2Data })
		} catch (e) {
			console.error(e)
			setError(e.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<DataContext.Provider
			value={{
				handleGetAllData,
				teamName,
				setTeamName,
				currentData,
				opp,
				loading,
				error,
				teamOptions: Object.values(teamLegend),
				selectedYear,
				setSelectedYear,
			}}
		>
			{children}
		</DataContext.Provider>
	)
}

export const useDataContext = () => {
	return useContext(DataContext)
}
