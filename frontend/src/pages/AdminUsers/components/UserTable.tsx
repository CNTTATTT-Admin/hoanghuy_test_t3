// Bảng user — STT, Avatar+Tên, Email, Role Select inline, Status Switch, ngày đăng ký, đăng nhập cuối, menu hành động

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import CircularProgress from '@mui/material/CircularProgress'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useState } from 'react'
import type { SystemUser } from '../../../services/userService'
import { ROLES, ROLE_LABELS, ROLE_COLORS, timeAgo } from '../../../services/userService'

// Màu nền nhạt cho chip-like Select
const selectSx = (role: string) => {
  const colorMap: Record<string, { bg: string; color: string }> = {
    USER: { bg: '#E3F2FD', color: '#0D47A1' },         // xanh dương nhẹ
    ANALYST: { bg: '#E8F5E9', color: '#1B5E20' },      // xanh lá
    ADMIN: { bg: '#FFEBEE', color: '#B71C1C' },        // đỏ nhấn
    ML_ENGINEER: { bg: '#FFF3E0', color: '#E65100' },  // cam
    COMPLIANCE: { bg: '#F3E5F5', color: '#4A148C' },   // tím
  }

  const style = colorMap[role] ?? { bg: '#ECEFF1', color: '#37474F' }

  return {
    '& .MuiSelect-select': {
      py: 0.5,
      px: 1,
      fontSize: '0.8125rem',
      fontWeight: 600,
      bgcolor: style.bg,
      color: style.color,
      borderRadius: 1,
    },
    '& fieldset': { border: 'none' },
    minWidth: 150,
  }
}

interface Props {
  users: SystemUser[]
  loading: boolean
  page: number          // 0-indexed (MUI)
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onRoleChange: (user: SystemUser, newRole: string) => void
  onStatusChange: (user: SystemUser, newActive: boolean) => void
  onViewDetail: (user: SystemUser) => void
  /** email của user đang đăng nhập — để disable đổi role / status cho chính mình */
  currentUserEmail?: string
}

export default function UserTable({
  users, loading, page, pageSize, total,
  onPageChange, onPageSizeChange,
  onRoleChange, onStatusChange, onViewDetail,
  currentUserEmail,
}: Props) {
  // Menu hành động (⋯)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuUser, setMenuUser] = useState<SystemUser | null>(null)

  const openMenu = (e: React.MouseEvent<HTMLElement>, user: SystemUser) => {
    setAnchorEl(e.currentTarget)
    setMenuUser(user)
  }
  const closeMenu = () => { setAnchorEl(null); setMenuUser(null) }

  // Kiểm tra có phải seed admin hoặc chính mình không
  const isSeedAdmin = (u: SystemUser) => u.email === 'admin@frauddetect.local'
  const isSelf = (u: SystemUser) => currentUserEmail === u.email

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={60} align="center">#</TableCell>
              <TableCell width={220}>Người dùng</TableCell>
              <TableCell width={220}>Email</TableCell>
              <TableCell width={170} align="center">Vai trò</TableCell>
              <TableCell width={120} align="center">Trạng thái</TableCell>
              <TableCell width={130}>Đăng ký lúc</TableCell>
              <TableCell width={130}>Đăng nhập cuối</TableCell>
              <TableCell width={60} align="center" />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">Không có user nào</Typography>
                </TableCell>
              </TableRow>
            ) : users.map((u, idx) => {
              const stt = page * pageSize + idx + 1
              const initials = (u.full_name || u.email).split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
              const disabled = isSeedAdmin(u) || isSelf(u)

              return (
                <TableRow key={u.user_uid} hover>
                  {/* STT */}
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">{stt}</Typography>
                  </TableCell>

                  {/* Avatar + Tên */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: 'primary.light' }}>
                        {initials}
                      </Avatar>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                        {u.full_name || '—'}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{u.email}</Typography>
                  </TableCell>

                  {/* Inline Role Select */}
                  <TableCell align="center">
                    <Select
                      size="small"
                      value={u.role}
                      disabled={disabled}
                      onChange={e => onRoleChange(u, e.target.value)}
                      sx={selectSx(u.role)}
                    >
                      {ROLES.map(r => (
                        <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  {/* Inline Status Switch */}
                  <TableCell align="center">
                    <Switch
                      size="small"
                      checked={u.is_active}
                      disabled={disabled}
                      color="success"
                      onChange={() => onStatusChange(u, !u.is_active)}
                    />
                  </TableCell>

                  {/* Ngày đăng ký */}
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </Typography>
                  </TableCell>

                  {/* Đăng nhập cuối (relative) */}
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {timeAgo(u.last_login_at)}
                    </Typography>
                  </TableCell>

                  {/* Menu hành động */}
                  <TableCell align="center">
                    <IconButton size="small" onClick={e => openMenu(e, u)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Phân trang */}
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={pageSize}
        onPageChange={(_, p) => onPageChange(p)}
        onRowsPerPageChange={e => onPageSizeChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Hiển thị"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
      />

      {/* Context menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { if (menuUser) onViewDetail(menuUser); closeMenu() }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> Xem chi tiết
        </MenuItem>
      </Menu>
    </>
  )
}
