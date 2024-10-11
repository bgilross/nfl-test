import * as React from 'react'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import TeamStatsDisplay from './TeamStatsDisplay'
import TeamStats from './TeamStats'
import { DataContext, useDataContext } from '../context/dataContext'

export default function TeamRankingsPopOver({ children, game }) {
  const [anchorEl, setAnchorEl] = React.useState(null)

  const { teamName } = useDataContext()

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }
  console.log('current Team: ', teamName)
  const open = Boolean(anchorEl)
  const data = game?.awayTeam?.name.includes(teamName)
    ? game.homeTeam
    : game.awayTeam

  console.log('Popver passing: data: ', data)
  console.log('Popover game: ', game)

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
          <TeamStats data={data} />
        </Typography>
      </Popover>
    </div>
  )
}
