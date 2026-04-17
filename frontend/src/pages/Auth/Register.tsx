// frontend/src/pages/Auth/Register.tsx
// Trang đăng ký — full_name, email, password, confirm password

import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
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
import { register } from '../../services/authService'

export function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)
    try {
      await register({ full_name: form.full_name, email: form.email, password: form.password })
      // Chuyển sang trang xác thực email
      navigate('/verify-email', { state: { email: form.email } })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng ký thất bại'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const formValid = form.full_name && form.email && form.password.length >= 8 && form.confirm

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
            Đăng ký tài khoản
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Họ và tên"
              fullWidth
              required
              margin="normal"
              value={form.full_name}
              onChange={set('full_name')}
              autoFocus
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              margin="normal"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
            <TextField
              label="Mật khẩu"
              type="password"
              fullWidth
              required
              margin="normal"
              value={form.password}
              onChange={set('password')}
              helperText="Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
              autoComplete="new-password"
            />
            <TextField
              label="Xác nhận mật khẩu"
              type="password"
              fullWidth
              required
              margin="normal"
              value={form.confirm}
              onChange={set('confirm')}
              autoComplete="new-password"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !formValid}
              sx={{ mt: 2, py: 1.2 }}
            >
              {loading ? <CircularProgress size={22} /> : 'Đăng ký'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Đã có tài khoản?{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                Đăng nhập
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
