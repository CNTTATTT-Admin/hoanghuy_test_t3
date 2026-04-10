/**
 * Users/index.tsx — Trang quản lý người dùng hệ thống.
 */
import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Box2 from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import { apiGet } from '../../services/apiClient'

type UserRole   = 'admin' | 'analyst' | 'viewer'
type UserStatus = 'active' | 'inactive' | 'suspended'

interface UserRecord {
  id:         string
  name:       string
  email:      string
  role:       UserRole
  status:     UserStatus
  lastLogin:  string
  txReviewed: number
}

const usersData: UserRecord[] = [
  { id: 'USR-001', name: 'Admin Hệ thống', email: 'admin@frauddetect.vn',      role: 'admin',   status: 'active',    lastLogin: '2026-03-31 09:30', txReviewed: 0 },
  { id: 'USR-002', name: 'Nguyễn Thành',   email: 'nthanh@frauddetect.vn',    role: 'analyst', status: 'active',    lastLogin: '2026-03-31 08:15', txReviewed: 142 },
  { id: 'USR-003', name: 'Trần Minh',      email: 'tminh@frauddetect.vn',     role: 'analyst', status: 'active',    lastLogin: '2026-03-31 09:00', txReviewed: 98 },
  { id: 'USR-004', name: 'Lê Hương',       email: 'lhuong@frauddetect.vn',    role: 'analyst', status: 'active',    lastLogin: '2026-03-30 17:45', txReviewed: 211 },
  { id: 'USR-005', name: 'Phạm Đức',       email: 'pduc@frauddetect.vn',      role: 'analyst', status: 'inactive',  lastLogin: '2026-03-28 14:20', txReviewed: 67 },
  { id: 'USR-006', name: 'Ngô Lan',        email: 'nlan@frauddetect.vn',      role: 'viewer',  status: 'active',    lastLogin: '2026-03-31 07:55', txReviewed: 0 },
  { id: 'USR-007', name: 'Đinh Tuấn',      email: 'dtuan@frauddetect.vn',     role: 'analyst', status: 'suspended', lastLogin: '2026-03-20 11:10', txReviewed: 34 },
]

const roleConfig: Record<UserRole, { label: string; color: 'error' | 'primary' | 'default' }> = {
  admin:   { label: 'Admin',     color: 'error' },
  analyst: { label: 'Phân tích', color: 'primary' },
  viewer:  { label: 'Xem',       color: 'default' },
}

const statusConfig: Record<UserStatus, { label: string; color: 'success' | 'default' | 'error' }> = {
  active:    { label: 'Hoạt động', color: 'success' },
  inactive:  { label: 'Không hoạt động', color: 'default' },
  suspended: { label: 'Tạm khóa', color: 'error' },
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
}

export function Users() {
  const theme = useTheme()
  const [page, setPage] = useState(0)
  const [rowsPerPage]   = useState(10)
  const [search, setSearch] = useState('')

  // --- Tra cứu user theo ID qua API ---
  const [lookupResult, setLookupResult] = useState<UserRecord | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)

  const handleSearch = async () => {
    const trimmed = search.trim()
    if (!trimmed) {
      setLookupResult(null)
      setLookupError(null)
      return
    }

    setLookupLoading(true)
    setLookupError(null)
    try {
      const data = await apiGet<{
        id:                 string
        name:               string
        email:              string | null
        risk_profile:       string
        total_transactions: number
        fraud_transactions: number
        fraud_rate:         number
      }>(`/api/v1/users/${encodeURIComponent(trimmed)}`)

      // Map risk_profile → trạng thái hiển thị
      const riskToStatus = (r: string): UserStatus => {
        if (r === 'high') return 'suspended'
        return 'active'
      }

      setLookupResult({
        id:         data.id,
        name:       data.name ?? data.id,
        email:      data.email ?? `${data.id}@frauddetect.vn`,
        role:       'analyst',
        status:     riskToStatus(data.risk_profile),
        lastLogin:  '—',
        txReviewed: data.total_transactions ?? 0,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không tìm thấy'
      setLookupError(msg.includes('404') ? `Không tìm thấy user "${trimmed}"` : msg)
      setLookupResult(null)
    } finally {
      setLookupLoading(false)
    }
  }

  // Nếu có lookupResult → hiển thị 1 dòng kết quả; ngược lại → filter cục bộ
  const filtered = lookupResult
    ? [lookupResult]
    : usersData.filter(
        (u) =>
          !search.trim() ||
          u.id.toLowerCase().includes(search.toLowerCase()) ||
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'text.primary', mb: 0.5 }}>Người dùng</Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý tài khoản và phân quyền hệ thống
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}>
        <CardContent sx={{ pb: 0 }}>
          <Box sx={{ maxWidth: 420, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Tìm theo tên, email hoặc ID (Enter để tra cứu API)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                if (!e.target.value.trim()) {
                  setLookupResult(null)
                  setLookupError(null)
                }
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.disabled', fontSize: 18 }} /> }}
            />
            <IconButton onClick={handleSearch} disabled={lookupLoading} size="small">
              {lookupLoading ? <CircularProgress size={20} /> : <SearchIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Box>

          {/* Thông báo lỗi hoặc kết quả tra cứu */}
          {lookupError && (
            <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
              {lookupError}
            </Typography>
          )}
          {lookupResult && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
              Hiển thị kết quả tra cứu từ API. Xóa ô tìm kiếm để về danh sách mặc định.
            </Typography>
          )}
        </CardContent>

        <TableContainer sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { borderColor: 'divider', color: 'text.disabled', fontSize: '0.7rem', fontWeight: 700, letterSpacing: 0.8 } }}>
                <TableCell>NGƯỜI DÙNG</TableCell>
                <TableCell>QUYỀN HẠN</TableCell>
                <TableCell align="center">TRẠNG THÁI</TableCell>
                <TableCell align="right">GD ĐÃ XEM XÉT</TableCell>
                <TableCell align="right">ĐĂNG NHẬP CUỐI</TableCell>
                <TableCell align="center">HÀNH ĐỘNG</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '& td': { borderColor: 'divider', fontSize: '0.82rem' },
                    '&:hover': { bgcolor: 'action.hover' },
                    '&:last-child td': { border: 0 },
                  }}
                >
                  <TableCell>
                    <Box2 sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 32, height: 32,
                          bgcolor: 'primary.main',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(row.name)}
                      </Avatar>
                      <Box2>
                        <Typography variant="body2" fontWeight={500} sx={{ color: 'text.primary' }}>
                          {row.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {row.email}
                        </Typography>
                      </Box2>
                    </Box2>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={roleConfig[row.role].label}
                      size="small"
                      color={roleConfig[row.role].color}
                      variant="outlined"
                      sx={{ fontSize: '0.68rem', height: 22 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={statusConfig[row.status].label}
                      size="small"
                      color={statusConfig[row.status].color}
                      sx={{ fontSize: '0.68rem', height: 22 }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {row.txReviewed > 0 ? row.txReviewed.toLocaleString('vi-VN') : '—'}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.disabled', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {row.lastLogin}
                  </TableCell>
                  <TableCell align="center">
                    <Box2 sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={row.status === 'suspended' ? 'Mở khóa' : 'Tạm khóa'}>
                        <IconButton
                          size="small"
                          sx={{ color: row.status === 'suspended' ? 'success.main' : 'warning.main' }}
                        >
                          <BlockOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box2>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={() => {}}
          labelRowsPerPage="Hàng/trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
          rowsPerPageOptions={[10]}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      </Card>
    </Box>
  )
}
