import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { useState } from 'react'

const TeamTable = ({ data }) => {
  const [currentCategory, setCurrentCategory] = useState('')
  const [currentStat, setCurrentStat] = useState('')
  const gamesData = data.team1.gamesData
  const categories = data.team1.categories
  const numWeeks = gamesData?.length

  const weeklyScores = gamesData?.map((game, index) => (
    <TableCell align="right" key={index}>
      <div>W{index + 1}</div>
      <div>{game.awayTeam.abbreviation}</div>
      <div>@</div>
      <div>{game.homeTeam.abbreviation}</div>
      <div>{game.awayTeam.score}</div>
      <div>{game.homeTeam.score}</div>
    </TableCell>
  ))

  if (!gamesData || !categories) {
    return (
      <div>
        {' '}
        <h4>No Table Data </h4>
        <button
          onClick={() => {
            console.log(data)
          }}
        >
          Check
        </button>
      </div>
    )
  }
  return (
    <div>
      <select
        value={currentCategory}
        onChange={({ target: { value } }) => setCurrentCategory(value)}
      >
        <option value="">Select a Category</option>
        {Object.keys(categories).map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {currentCategory && (
        <select
          value={currentStat}
          onChange={(e) => setCurrentStat(e.target.value)}
        >
          <option value="">Select a stat</option>
          {Object.keys(categories[currentCategory]).length > 0 &&
            Object.keys(Object.values(categories[currentCategory])[0]).map(
              (stat) => (
                <option key={stat} value={stat}>
                  {stat}
                </option>
              )
            )}
        </select>
      )}

      <TableContainer component={Paper} elevation={7}>
        <Table padding="none" size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <div>Player</div>
              </TableCell>
              <TableCell>
                <div>Stat</div>
                <div>{currentStat}</div>
              </TableCell>
              {weeklyScores}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(categories).map(([categoryName, players]) => (
              <React.Fragment key={categoryName}>
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    colSpan={numWeeks + 1}
                    style={{ fontWeight: 'bold' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div>{categoryName.toUpperCase()}</div>
                        <button
                          onClick={() => {
                            console.log(
                              Object.entries(players).map(
                                (player, stat) => stat
                              )
                            )
                          }}
                        >
                          Check
                        </button>
                      </div>
                      {currentStat && <div>{currentStat}</div>}
                    </div>
                  </TableCell>
                </TableRow>

                {Object.entries(players).map(([playerName, playerStats]) => (
                  <TableRow key={playerName}>
                    <TableCell>
                      {playerName}{' '}
                      <button
                        onClick={() => {
                          console.log(playerStats)
                        }}
                      >
                        Check
                      </button>
                    </TableCell>
                    <TableCell> = </TableCell>
                    {playerStats[currentStat]?.map((stat, index) => (
                      <TableCell align="right" key={index}>
                        {stat}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
export default TeamTable
