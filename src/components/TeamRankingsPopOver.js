import * as React from 'react'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import TeamRankings from './TeamRankings'
import { useDataContext } from '../context/dataContext'

export default function TeamRankingsPopOver({ children, game, teamNum }) {
  const [anchorEl, setAnchorEl] = React.useState(null)

  const { teamName, opp } = useDataContext()

  const name = teamNum === 'team1' ? teamName : opp

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  console.log('pre setting daata: game: and name ', game, name)
  const data = game.awayTeam.name.toLowerCase().includes(name.toLowerCase())
    ? game.homeTeam
    : game.awayTeam

  console.log('data created: data: ', data)
  console.log('awayTeam.name: ', game.awayTeam.name)
  console.log('name: ', name)
  console.log(game.awayTeam.name.toLowerCase().includes(name.toLowerCase()))

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
          <TeamRankings data={data} />
        </Typography>
      </Popover>
    </div>
  )
}
