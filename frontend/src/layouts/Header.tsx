/**
 * Header.tsx — Thanh header cố định trên cùng.
 * Chiều cao lấy từ theme.layout.headerHeight — không hardcode.
 */
import { useState, useEffect, useRef } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
// import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'
import SecurityIcon from '@mui/icons-material/Security'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import BlockIcon from '@mui/icons-material/Block'
import { useBlockedAlerts } from '../hooks/useBlockedAlerts'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' })
  const { notifications, unreadCount, markAllRead, refresh } = useBlockedAlerts(15_000)
  const notifRef = useRef<HTMLDivElement>(null)

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Lắng nghe sự kiện fraud-blocked từ CheckTransaction để cập nhật bell ngay lập tức
  // Delay 1.5s để chờ BackgroundTask backend lưu alert vào DB trước khi poll
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const handler = () => {
      timer = setTimeout(() => refresh(), 1500)
    }
    window.addEventListener('fraud-blocked', handler)
    return () => {
      window.removeEventListener('fraud-blocked', handler)
      clearTimeout(timer)
    }
  }, [refresh])

  // Lắng nghe batch-fraud-blocked — hiển snackbar và refresh bell
  useEffect(() => {
    const handler = (e: Event) => {
      const { blockedCount, totalTransactions } = (e as CustomEvent).detail as { blockedCount: number; totalTransactions: number }
      setSnackbar({
        open: true,
        message: `🚫 ${blockedCount}/${totalTransactions} giao dịch từ CSV đã bị chặn!`,
      })
      setTimeout(() => refresh(), 1500)
    }
    window.addEventListener('batch-fraud-blocked', handler)
    return () => window.removeEventListener('batch-fraud-blocked', handler)
  }, [refresh])

  return (
    <>
      <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: theme.layout.headerHeight,
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        borderBottom: 1,
        borderColor: 'divider',
        width: '100%',
      }}
    >
      <Toolbar
        sx={{
          height: theme.layout.headerHeight,
          minHeight: `${theme.layout.headerHeight}px !important`,
          px: 3,
        }}
      >
        {/* Logo + Tên hệ thống */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SecurityIcon sx={{ color: 'primary.main', fontSize: 26 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 0.5 }}
          >
            FraudDetect
           
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Notification Bell — giao dịch bị chặn tự động */}
        <Box ref={notifRef} sx={{ position: 'relative', mr: 1 }}>
          <IconButton
            size="small"
            aria-label="Thông báo giao dịch bị chặn"
            onClick={() => { setNotifOpen(o => !o); markAllRead(); }}
            sx={{ color: 'text.secondary' }}
          >
            <Badge badgeContent={unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined} color="error">
              <NotificationsOutlinedIcon />
            </Badge>
          </IconButton>

          {/* Dropdown panel */}
          {notifOpen && (
            <Paper
              elevation={8}
              sx={{
                position: 'absolute',
                right: 0,
                top: '100%',
                mt: 1,
                width: 320,
                zIndex: 1300,
                overflow: 'hidden',
                border: 1,
                borderColor: 'divider',
              }}
            >
              {/* Header panel */}
              <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  🚫 Giao dịch bị chặn
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notifications.length} thông báo
                </Typography>
              </Box>

              {/* Danh sách thông báo */}
              <List disablePadding sx={{ maxHeight: 288, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="Không có giao dịch bị chặn"
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', textAlign: 'center' }}
                    />
                  </ListItem>
                ) : notifications.map((n, idx) => (
                  <Box key={n.id}>
                    <ListItem alignItems="flex-start" sx={{ '&:hover': { bgcolor: 'error.50' }, py: 1 }}>
                      <BlockIcon sx={{ color: 'error.main', mr: 1.5, mt: 0.25, fontSize: 18, flexShrink: 0 }} />
                      <Box minWidth={0}>
                        <Typography variant="caption" fontWeight={700} color="error.main" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Bị chặn tự động
                        </Typography>
                        <Typography variant="caption" display="block" color="text.primary" noWrap>
                          Mã GD: <Box component="span" sx={{ fontFamily: 'monospace' }}>{n.transaction_id}</Box>
                        </Typography>
                        {n.tx_type && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Loại: {n.tx_type}
                          </Typography>
                        )}
                        {n.amount != null && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Số tiền: {n.amount.toLocaleString('vi-VN')} VND
                          </Typography>
                        )}
                        <Typography variant="caption" display="block" color="text.secondary">
                          Xác suất GD:{' '}
                          <Box component="strong" sx={{ color: 'error.main' }}>
                            {(n.fraud_probability * 100).toFixed(1)}%
                          </Box>
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', mt: 0.25 }}>
                          {new Date(n.blocked_at).toLocaleString('vi-VN')}
                        </Typography>
                      </Box>
                    </ListItem>
                    {idx < notifications.length - 1 && <Divider component="li" />}
                  </Box>
                ))}
              </List>

              {/* Xem tất cả thông báo */}
              <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                <Button
                  size="small"
                  fullWidth
                  onClick={() => { setNotifOpen(false); navigate('/notifications') }}
                  sx={{ color: 'primary.main', textTransform: 'none', fontSize: '12px' }}
                >
                  Xem tất cả thông báo →
                </Button>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Avatar người dùng */}
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: 'primary.main',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            ml: 1.3,
          }}
        >
          AD
        </Avatar>
      </Toolbar>
    </AppBar>

    {/* Snackbar: thông báo batch CSV bị chặn */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={5000}
      onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 7 }}
    >
      <Alert
        severity="error"
        variant="filled"
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        sx={{ cursor: 'pointer', '& .MuiAlert-message': { width: '100%' } }}
        onClick={() => { navigate('/notifications'); setSnackbar(prev => ({ ...prev, open: false })) }}
      >
        {snackbar.message}
        <Typography sx={{ fontSize: '11px', mt: 0.5, opacity: 0.85 }}>
          Ấn để xem chi tiết →
        </Typography>
      </Alert>
    </Snackbar>
    </>
  )
}

