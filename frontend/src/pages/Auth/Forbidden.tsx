// frontend/src/pages/Auth/Forbidden.tsx
// Trang 403 — hiển thị khi user không đủ quyền truy cập

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Forbidden() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: 2,
        p: 4,
      }}
    >
      <LockOutlinedIcon sx={{ fontSize: 80, color: 'error.main', opacity: 0.7 }} />

      <Typography variant="h3" fontWeight={700} color="error.main">
        403
      </Typography>

      <Typography variant="h6" color="text.primary">
        Không có quyền truy cập
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
        Bạn không có quyền truy cập trang này.
        Liên hệ quản trị viên để được cấp quyền.
      </Typography>

      {user && (
        <Typography variant="body2" color="text.disabled">
          Vai trò của bạn: <strong>{user.role}</strong>
        </Typography>
      )}

      <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 1 }}>
        Về trang chủ
      </Button>
    </Box>
  )
}
