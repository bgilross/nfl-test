import * as React from 'react'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import TeamStatsDisplay from './TeamStatsDisplay'
import TeamStats from './TeamStats'
import { DataContext, useDataContext } from '../context/dataContext'
import PlayerTable from './PlayerTable'

const PlayerPopOver = ({ children, gamesData, playerName }) => {
  const [anchorEl, setAnchorEl] = React.useState(null)

  const { currentTeam } = useDataContext()

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  return (
    <div>
      <Typography
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {children}
      </Typography>
      <Popover
        id="mouse-over-popover"
        sx={{ pointerEvents: 'none' }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        {/* <Typography sx={{ p: 1 }}> */}
        <PlayerTable playerName={playerName} />
        {/* </Typography> */}
      </Popover>
    </div>
  )
}

export default PlayerPopOver
