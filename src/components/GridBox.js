import Grid from '@mui/material/Grid2'
import Box from '@mui/material/Box'

const GridBox = ({ children }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  )
}
export default GridBox
