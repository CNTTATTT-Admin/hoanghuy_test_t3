import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { TransactionListModal } from '../components/modals/TransactionListModal'

export function DashboardTransactions() {
  const navigate = useNavigate()
  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ px: 3, pt: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ color: '#94A3B8', mb: 1 }}
        >
          Quay lại Dashboard
        </Button>
      </Box>
      <TransactionListModal open={true} onClose={() => navigate('/')} />
    </Box>
  )
}
