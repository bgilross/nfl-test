import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

const TeamTable = ({ teamName }) => {


  const removePlayer = () => {
    setPlayerList((prevPlayerList) =>
      prevPlayerList.filter((item) => item !== player.name)
    )

    setPlayersStats((prevPlayersStats) =>
      prevPlayersStats.filter((item) => item.name !== player.name)
    )
  }

  const handleValueTest = () => {
    console.log('GamesData.length: ', gamesData.length)
    console.log('Categories, and length: ', categories, categories.length)
    console.log('Player: ', player)
  }

  if (!gamesData || !categories) {
    return <div> Loading </div>
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
                <div>{player.name}</div>
                <button onClick={removePlayer}>REMOVE</button>
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
            {Object.entries(categories).map(([categoryName, stats]) => (
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

                {/* Loop over each stat description (e.g., Yards, Touchdowns) */}
                {Object.keys(stats).map((description) => (
                  <TableRow key={description}>
                    <TableCell component="th" scope="row">
                      {description}
                    </TableCell>
                    {/* Render the stat values for each week */}
                    {stats[description].map((statValue, i) => (
                      <TableCell
                        style={{ paddingRight: '4px' }}
                        sx={{ borderRight: '1px solid black' }}
                        align="right"
                        key={i}
                      >
                        {statValue !== null ? `${statValue}` : '-'}
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
