import * as React from 'react'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import TeamStatsDisplay from './TeamStatsDisplay'
import TeamStats from './TeamStats'
import { DataContext, useDataContext } from '../context/dataContext'
import PlayerTable from './prevComponents/PlayerTable'

export default function TeamRankingsPopOver({ children, game }) {
  const [anchorEl, setAnchorEl] = React.useState(null)

  const { currentTeam } = useDataContext()

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const data = game.awayTeam.name.includes(currentTeam)
    ? game.awayTeam
    : game.homeTeam

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
        <Typography sx={{ p: 1 }}>
          <PlayerTable />
        </Typography>
      </Popover>
    </div>
  )
}
