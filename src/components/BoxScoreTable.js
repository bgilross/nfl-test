import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

const BoxScoreTable = ({ game, teamNum }) => {
  const index = teamNum === 'team1' ? 0 : 1
  const boxScore = game.boxScore ? game.boxScore[index] : null

  if (!boxScore) {
    return <div> Loading</div>
  }
  return (
    <div>
      <TableContainer component={Paper} elevation={7}>
        <Table padding="none" size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ backgroundColor: `#${boxScore.team.alternateColor}` }}
                component="th"
                scope="row"
                colSpan={2}
              >
                <div>
                  <img src={boxScore?.team.logo} height={100} />
                </div>
              </TableCell>
              <TableCell
                sx={{ backgroundColor: `#${boxScore.team.color}` }}
                component="th"
                scope="row"
                colSpan={8}
              ></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boxScore.statistics.map((statCat, index) => {
              if (
                statCat.name === 'passing' ||
                statCat.name === 'rushing' ||
                statCat.name === 'receiving'
              ) {
                return (
                  <React.Fragment key={statCat.name}>
                    <TableRow>
                      <TableCell
                        component="th"
                        scope="row"
                        colSpan={10}
                        style={{ fontWeight: 'bold' }}
                        sx={{
                          backgroundColor: `#${boxScore.team.color}`,
                          color: `#${boxScore.team.alternateColor}`,
                        }}
                      >
                        {statCat.name.toUpperCase()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Player</TableCell>
                      <TableCell></TableCell>
                      {statCat.labels.map((label, index) => (
                        <TableCell key={index}>{label}</TableCell>
                      ))}
                    </TableRow>
                    {statCat.athletes.map((athlete, index) => (
                      <TableRow key={athlete.athlete.displayName}>
                        <TableCell>{athlete.athlete.displayName}</TableCell>
                        <TableCell></TableCell>
                        {athlete.stats.map((stat, index) => (
                          <TableCell key={index}>{stat}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </React.Fragment>
                )
              }
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
export default BoxScoreTable
