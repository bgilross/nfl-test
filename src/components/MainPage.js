import React, { useEffect, useState } from 'react'
import axios from 'axios'
import TablePage from './TablePage'
import TeamStats from './TeamStats'
import PaperContainer from './PaperContainer'
import GridBox from './GridBox'
import Grid from '@mui/material/Grid2'

const MainPage = () => {
  const [teamName1, setTeamName1] = useState('Bills')
  const [teamName2, setTeamName2] = useState('Texans')
  const [gameIds, setGameIds] = useState([])
  const [playerList, setPlayerList] = useState([])
  const [playerName, setPlayerName] = useState('James Cook')

  const handleTeam1TextChange = (e) => {
    setTeamName1(e.target.value)
  }

  const handleTeam2TextChange = (e) => {
    setTeamName2(e.target.value)
  }

  const handlePlayerNameChange = (e) => {
    setPlayerName(e.target.value)
  }

  const handleAddPlayer = () => {
    setPlayerList((prevPlayerList) => [...prevPlayerList, playerName])
    setPlayerName('')
  }

  const fetchGameID = async (week, teamName) => {
    const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2024&seasontype=2&week=${week}`
    try {
      const response = await axios.get(apiUrl)
      const teamGame = response.data.events.find((event) =>
        event.name.includes(teamName)
      )
      return teamGame.id
    } catch (err) {
      console.log(`Error fetching data for ${teamName} week: ${week}`, err)
    }
  }

  const fetchAllGameIDs = async () => {
    let allGameIds = []

    for (let week = 1; week <= 4; week++) {
      const team1ID = await fetchGameID(week, teamName1)
      const team2ID = await fetchGameID(week, teamName2)
      allGameIds.push(team1ID, team2ID)
    }
    setGameIds(allGameIds)
  }

  return (
    <GridBox>
      <Grid size={8} className="LeftSide">
        <PaperContainer>
          <input
            type="text"
            value={teamName1}
            onChange={handleTeam1TextChange}
          />
          <input
            type="text"
            value={teamName2}
            onChange={handleTeam2TextChange}
          />
          <button onClick={fetchAllGameIDs}>Get Data</button>
          <div>
            <input
              type="text"
              value={playerName}
              onChange={handlePlayerNameChange}
            />
            <button onClick={handleAddPlayer}>Add Player</button>
          </div>
        </PaperContainer>

        <div style={{ padding: '4px' }}>
          <TablePage
            playerList={playerList}
            gameIDs={gameIds}
            setPlayerList={setPlayerList}
          />
        </div>
      </Grid>
      <Grid size={4} className="RightSide">
        <TeamStats teamName1={teamName1} teamName2={teamName2} />
      </Grid>
    </GridBox>
  )
}
export default MainPage
