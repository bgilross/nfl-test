import React, { useEffect, useState } from 'react'
import axios from 'axios'
import GameStats from './GameStats'

const MainPage = () => {
  const [teamName1, setTeamName1] = useState('Falcons')
  const [teamName2, setTeamName2] = useState('Buc')
  const [team1IDs, setTeam1IDs] = useState([])
  const [team2IDs, setTeam2IDs] = useState([])
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
    // const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2024&seasontype=2&week=1`
    // try {
    //   const response = await axios.get(apiUrl)
    //   console.log(response)
    //   const teamGame = response.data.events.find((event) =>
    //     event.name.includes('Chiefs')
    //   )
    //   console.log(teamGame)
    // } catch (err) {
    //   console.log('Error fetching data for week 1: ')
    // }
    const apiUrl = `https://cdn.espn.com/core/nfl/boxscore?xhr=1&gameId=401671741`

    try {
      const response = await axios.get(apiUrl)
      console.log(
        response.data.gamepackageJSON.header.competitions[0].competitors
      )
    } catch (err) {
      console.log(err)
    }
  }

  const fetchGameID = async (week, teamName) => {
    const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2024&seasontype=2&week=${week}`
    console.log('apirURL: ', apiUrl)
    console.log('week: ', week)
    console.log('teamName ', teamName)
    try {
      const response = await axios.get(apiUrl)
      const teamGame = response.data.events.find((event) =>
        event.name.includes(teamName)
      )
      console.log({ teamGame })
      return teamGame.id
    } catch (err) {
      console.log(`Error fetching data for ${teamName} week: ${week}`, err)
      // setError(err.message)
    }
  }

  const fetchAllGameIDs = async () => {
    let allTeam1IDs = []
    let allTeam2IDs = []
    let allGameIds = []

    for (let week = 1; week <= 4; week++) {
      const team1ID = await fetchGameID(week, teamName1)
      const team2ID = await fetchGameID(week, teamName2)
      allTeam1IDs.push(team1ID)
      allTeam2IDs.push(team2ID)
      allGameIds.push(team1ID, team2ID)
    }

    setTeam1IDs(allTeam1IDs)
    setTeam2IDs(allTeam2IDs)
    setGameIds(allGameIds)
  }

  return (
    <div>
      Main Page
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
        {team1IDs.length > 0 ? (
          team1IDs.map((id, index) => <li key={index}>{id}</li>)
        ) : (
          <li>no {teamName1} games found</li>
        )}
      </ul>
      <ul>
        {team2IDs.length > 0 ? (
          team2IDs.map((id, index) => <li key={index}>{id}</li>)
        ) : (
          <li>no {teamName2} games found</li>
        )}
      </ul>
      <button onClick={apiTest}>API TEST</button>
      <div>
        <input
          type="text"
          name="playerName"
          id="playerName"
          value={playerName}
          onChange={handlePlayerNameChange}
        />
        <button onClick={handleAddPlayer}>Add Player</button>
        <div>
          {playerList.map((player, index) => (
            <h1 key={index}>{player}</h1>
          ))}
        </div>
      </div>
      <div>
        {playerList}
        {playerName}
      </div>
      <div>
        {gameIds.map((gameID, index) => (
          <div key={index}>
            <GameStats gameID={gameID} playerList={playerList} />
          </div>
        ))}
      </div>
    </div>
  )
}
export default MainPage
