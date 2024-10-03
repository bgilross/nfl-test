import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

const PlayerTable = ({ player, setPlayerList }) => {
  const categories = Object.keys(player).filter((key) => key !== 'name')
  const numWeeks = Object.values(player[categories[0]])[0].length

  const removePlayer = () => {
    // Filter the player out of the playerList
    setPlayerList((prevPlayerList) =>
      prevPlayerList.filter((item) => item !== player.name)
    )
  }

  return (
    <div>
      <h1>Player Table Component</h1>
      <h2>Name: {player.name} </h2>
      <button onClick={removePlayer}>REMOVE</button>

      <TableContainer component={Paper} elevation={7}>
        <Table
          sx={{ minWidth: 650 }}
          padding="none"
          size="small"
          aria-label="simple table"
        >
          <TableHead>
            <TableRow>
              <TableCell> STATISTIC </TableCell>
              {[...Array(numWeeks)].map((_, i) => (
                <TableCell key={i}>W:{i + 1}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <React.Fragment key={category}>
                <TableRow key={category}>
                  <TableCell
                    component="th"
                    scope="row"
                    colSpan={numWeeks + 1}
                    style={{ fontWeight: 'bold' }}
                  >
                    {category.toUpperCase()}
                  </TableCell>
                </TableRow>

                {Object.keys(player[category]).map((description) => (
                  <TableRow key={description}>
                    <TableCell component="th" scope="row">
                      {description}
                    </TableCell>
                    {player[category][description].map((statValue, i) => (
                      <TableCell key={i}>{statValue}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>

    // <div>

    //   <TableContainer component={Paper}>
    //     <Table sx={{ minWidth: 650 }} aria-label="simple table">
    //       <TableHead>
    //         <TableRow>
    //           <TableCell>Dessert (100g serving)</TableCell>
    //           <TableCell align="right">Calories</TableCell>
    //           <TableCell align="right">Fat&nbsp;(g)</TableCell>
    //           <TableCell align="right">Carbs&nbsp;(g)</TableCell>
    //           <TableCell align="right">Protein&nbsp;(g)</TableCell>
    //         </TableRow>
    //       </TableHead>
    //       <TableBody>
    //         {rows.map((row) => (
    //           <TableRow
    //             key={row.name}
    //             sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    //           >
    //             <TableCell component="th" scope="row">
    //               {row.name}
    //             </TableCell>
    //             <TableCell align="right">{row.calories}</TableCell>
    //             <TableCell align="right">{row.fat}</TableCell>
    //             <TableCell align="right">{row.carbs}</TableCell>
    //             <TableCell align="right">{row.protein}</TableCell>
    //           </TableRow>
    //         ))}
    //       </TableBody>
    //     </Table>
    //   </TableContainer>
    // </div>
  )
}
export default PlayerTable
