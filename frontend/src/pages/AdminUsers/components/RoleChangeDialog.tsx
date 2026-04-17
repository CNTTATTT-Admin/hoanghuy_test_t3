// Dialog xác nhận đổi vai trò — hiển thị quyền hạn của role mới

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Box from '@mui/material/Box'
import type { SystemUser } from '../../../services/userService'
import { ROLE_LABELS, ROLE_COLORS, ROLE_PERMISSIONS } from '../../../services/userService'

interface Props {
  open: boolean
  user: SystemUser | null
  newRole: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function RoleChangeDialog({ open, user, newRole, loading, onConfirm, onCancel }: Props) {
  if (!user) return null

  const permissions = ROLE_PERMISSIONS[newRole] ?? []

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>⚠️ Xác nhận thay đổi vai trò</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" gutterBottom>
          Bạn có chắc muốn đổi vai trò của
        </Typography>
        <Typography variant="subtitle2" fontWeight={700}>
          {user.full_name} ({user.email})
        </Typography>

        {/* Hiển thị role cũ → mới */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
          <Chip label={ROLE_LABELS[user.role] ?? user.role} size="small" color={ROLE_COLORS[user.role] ?? 'default'} />
          <ArrowForwardIcon fontSize="small" color="action" />
          <Chip label={ROLE_LABELS[newRole] ?? newRole} size="small" color={ROLE_COLORS[newRole] ?? 'default'} />
        </Box>

        {/* Mô tả quyền hạn */}
        {permissions.length > 0 && (
          <>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Vai trò mới sẽ có quyền:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {permissions.map(p => (
                <li key={p}>
                  <Typography variant="body2">{p}</Typography>
                </li>
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>Hủy</Button>
        <Button variant="contained" onClick={onConfirm} disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Xác nhận'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
