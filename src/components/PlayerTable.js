import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { DataContext, useDataContext } from '../context/dataContext'

const PlayerTable = ({ playerName }) => {
  const { currentData } = useDataContext()
  const { gamesData, categories } = currentData.team1
  const numWeeks = gamesData?.length

  if (!currentData || !gamesData || !categories) {
    return <div> Loading</div>
  }
  return (
    <div
      style={{
        padding: '4px',
      }}
    >
      <TableContainer component={Paper} elevation={7}>
        <Table padding="none" size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <div>STATISTIC</div>
                <div>{playerName}</div>
              </TableCell>
              {gamesData.map((game, index) => (
                <TableCell align="right" key={index}>
                  <div>W{index + 1}</div>
                  <div>{game.awayTeam.abbreviation}</div>
                  <div>@</div>
                  <div>{game.homeTeam.abbreviation}</div>
                  <div>{game.awayTeam.score}</div>
                  <div>{game.homeTeam.score}</div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(categories).map(([categoryName, players]) =>
              players[playerName] ? (
                <React.Fragment key={categoryName}>
                  {/* Display the category name (e.g., Rushing, Receiving) */}
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      colSpan={numWeeks + 1}
                      style={{ fontWeight: 'bold' }}
                    >
                      {categoryName.toUpperCase()}
                    </TableCell>
                  </TableRow>
                  {Object.entries(players[playerName]).map(
                    ([statName, values]) => {
                      return (
                        <TableRow key={statName}>
                          <TableCell>{statName}</TableCell>
                          <TableCell> = </TableCell>
                          {values.map((value, index) => (
                            <TableCell key={index}>{value}</TableCell>
                          ))}
                        </TableRow>
                      )
                    }
                  )}
                </React.Fragment>
              ) : null
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
export default PlayerTable
