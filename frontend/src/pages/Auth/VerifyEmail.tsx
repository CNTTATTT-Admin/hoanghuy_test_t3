// frontend/src/pages/Auth/VerifyEmail.tsx
// Trang xác thực email — nhập 6 ký tự mã xác thực, có nút gửi lại

import { useState } from 'react'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import SecurityIcon from '@mui/icons-material/Security'
import Link from '@mui/material/Link'
import { verifyEmail, resendVerification } from '../../services/authService'

export function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const emailFromState = (location.state as { email?: string })?.email ?? ''

  const [email, setEmail] = useState(emailFromState)
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const resp = await verifyEmail(email, token)
      setSuccess(resp.message || 'Xác thực email thành công!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xác thực thất bại'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setSuccess('')
    setResending(true)
    try {
      const resp = await resendVerification(email)
      setSuccess(resp.message || 'Đã gửi lại mã xác thực!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gửi lại thất bại'
      setError(msg)
    } finally {
      setResending(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
            <SecurityIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={700} color="primary.main">
              FraudDetect
            </Typography>
          </Box>

          <Typography variant="h6" textAlign="center" gutterBottom>
            Xác thực email
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
            Nhập mã 6 ký tự đã gửi đến email của bạn
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleVerify} noValidate>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              label="Mã xác thực"
              fullWidth
              required
              margin="normal"
              value={token}
              onChange={e => setToken(e.target.value)}
              inputProps={{ maxLength: 6 }}
              placeholder="123456"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !email || token.length < 6}
              sx={{ mt: 2, py: 1.2 }}
            >
              {loading ? <CircularProgress size={22} /> : 'Xác thực'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              size="small"
              onClick={handleResend}
              disabled={resending || !email}
              sx={{ textTransform: 'none' }}
            >
              {resending ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
              Gửi lại mã xác thực
            </Button>
          </Box>

          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2" underline="hover">
              Quay lại đăng nhập
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
