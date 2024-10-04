import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'

const PaperContainer = ({ children }) => {
  return (
    <Paper
      elevation={3}
      sx={{ padding: '20px', margin: '20px', maxWidth: '800px' }}
    >
      <Box>{children}</Box>
    </Paper>
  )
}
export default PaperContainer
