// Modal chi tiết user — thông tin tài khoản + lịch sử thay đổi (audit log)

import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import type { SystemUser, AuditEntry } from '../../../services/userService'
import { ROLE_LABELS, ROLE_COLORS, getUserAuditLog, timeAgo } from '../../../services/userService'

interface Props {
  open: boolean
  user: SystemUser | null
  onClose: () => void
}

export default function UserDetailModal({ open, user, onClose }: Props) {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Tải audit log khi mở modal
  useEffect(() => {
    if (!open || !user) { setLogs([]); return }
    let cancelled = false
    ;(async () => {
      setLoadingLogs(true)
      try {
        const data = await getUserAuditLog(user.user_uid)
        if (!cancelled) setLogs(data.logs)
      } catch { /* bỏ qua */ }
      if (!cancelled) setLoadingLogs(false)
    })()
    return () => { cancelled = true }
  }, [open, user])

  if (!user) return null

  const initials = (user.full_name || user.email)
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>👤 Chi tiết người dùng</DialogTitle>
      <DialogContent dividers>
        {/* Header — avatar + tên + email + role + status */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 22 }}>
            {initials}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>{user.full_name || '—'}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip
                label={ROLE_LABELS[user.role] ?? user.role}
                size="small"
                color={ROLE_COLORS[user.role] ?? 'default'}
              />
              <Chip
                label={user.is_active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                size="small"
                color={user.is_active ? 'success' : 'default'}
                variant={user.is_active ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Thông tin tài khoản */}
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Thông tin tài khoản
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.5 } }}>
          <li>
            <Typography variant="body2">
              <strong>ID:</strong> {user.user_uid}
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Đăng ký:</strong> {new Date(user.created_at).toLocaleString('vi-VN')}
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Đăng nhập cuối:</strong>{' '}
              {user.last_login_at
                ? new Date(user.last_login_at).toLocaleString('vi-VN')
                : '—'}
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <strong>Email verified:</strong>
              {user.is_email_verified
                ? <><CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} /> Đã xác thực</>
                : <><CancelIcon sx={{ fontSize: 16, color: 'text.disabled' }} /> Chưa xác thực</>}
            </Typography>
          </li>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Lịch sử thay đổi */}
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Lịch sử thay đổi
        </Typography>
        {loadingLogs ? (
          <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={24} /></Box>
        ) : logs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Không có lịch sử</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Thời gian</TableCell>
                <TableCell>Hành động</TableCell>
                <TableCell>Cũ → Mới</TableCell>
                <TableCell>Thực hiện bởi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Typography variant="caption">{timeAgo(log.created_at)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{log.action}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {log.old_value ?? '—'} → {log.new_value ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{log.changed_by_email ?? 'Hệ thống'}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}
