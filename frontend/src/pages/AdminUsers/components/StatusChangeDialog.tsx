// Dialog xác nhận kích hoạt / vô hiệu hóa tài khoản

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { SystemUser } from '../../../services/userService'

interface Props {
  open: boolean
  user: SystemUser | null
  newActive: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function StatusChangeDialog({ open, user, newActive, loading, onConfirm, onCancel }: Props) {
  if (!user) return null

  const title = newActive ? 'Kích hoạt tài khoản' : 'Vô hiệu hóa tài khoản'
  const message = newActive
    ? `Kích hoạt lại tài khoản "${user.full_name}"? Người dùng sẽ có thể đăng nhập trở lại.`
    : `Vô hiệu hóa tài khoản "${user.full_name}"? Người dùng sẽ không thể đăng nhập.`

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>⚠️ {title}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2">{message}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Email: {user.email}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>Hủy</Button>
        <Button
          variant="contained"
          color={newActive ? 'success' : 'error'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
