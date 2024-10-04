import React, { useEffect, useState } from 'react'
import axios from 'axios'
import GameStats from './GameStats'
import TablePage from './TablePage'
import TeamStats from './TeamStats'

const MainPage = () => {
  const [teamName1, setTeamName1] = useState('Buc')
  const [teamName2, setTeamName2] = useState('Falcons')
  const [gameIds, setGameIds] = useState([])
  const [playerList, setPlayerList] = useState([])
  const [playerName, setPlayerName] = useState('')

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

  const apiTest = async () => {
    const apiUrl = `https://cdn.espn.com/core/nfl/boxscore?xhr=1&gameId=401671741`

    try {
      const response = await axios.get(apiUrl)
    } catch (err) {
      console.log(err)
    }
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
      // setError(err.message)
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
    <div>
      <input
        type="text"
        name="teamName1"
        id="teamName1"
        value={teamName1}
        onChange={handleTeam1TextChange}
      />
      <input
        type="text"
        name="teamName2"
        id="teamName2"
        value={teamName2}
        onChange={handleTeam2TextChange}
      />
      <button onClick={fetchAllGameIDs}>Get Data</button>
      <ul>
        {gameIds.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      {/* <button onClick={apiTest}>API TEST</button> */}
      <div>
        <input
          type="text"
          name="playerName"
          id="playerName"
          value={playerName}
          onChange={handlePlayerNameChange}
        />
        <button onClick={handleAddPlayer}>Add Player</button>
        {/* <div>
          {playerList.map((player, index) => (
            <h1 key={index}>Player List Map : {player}</h1>
          ))}
        </div> */}
      </div>
      <TeamStats teamName1={teamName1} teamName2={teamName2} />
      <div style={{ padding: '4px' }}>
        <TablePage
          playerList={playerList}
          gameIDs={gameIds}
          setPlayerList={setPlayerList}
        />
      </div>
      {/* <div>
        {gameIds.map((gameID, index) => (
          <div key={index}>
            <GameStats gameID={gameID} playerList={playerList} />
          </div>
        ))}
      </div> */}
    </div>
  )
}
export default MainPage
