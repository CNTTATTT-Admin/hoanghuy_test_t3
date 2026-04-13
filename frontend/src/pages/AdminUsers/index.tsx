// frontend/src/pages/AdminUsers/index.tsx
// Trang quản lý tài khoản hệ thống — chỉ ADMIN
// Compose các component con: StatsCards, Filters, Table, Dialogs, Modal

import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { useAuth } from '../../hooks/useAuth'
import type { SystemUser, UserStats } from '../../services/userService'
import { getUsers, getUserStats, updateUserRole, updateUserStatus } from '../../services/userService'
import UserStatsCards from './components/UserStatsCards'
import UserFilters from './components/UserFilters'
import UserTable from './components/UserTable'
import RoleChangeDialog from './components/RoleChangeDialog'
import StatusChangeDialog from './components/StatusChangeDialog'
import UserDetailModal from './components/UserDetailModal'

// ── Component chính ──────────────────────────────────────────────────
export function AdminUsers() {
  const { user: currentUser } = useAuth()

  // Dữ liệu
  const [users, setUsers] = useState<SystemUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)           // MUI 0-indexed
  const [pageSize, setPageSize] = useState(20)
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')   // '' | 'active' | 'inactive'
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [snackbar, setSnackbar] = useState('')

  // Dialog / Modal state
  const [roleDialog, setRoleDialog] = useState<{ open: boolean; user: SystemUser | null; newRole: string }>({
    open: false, user: null, newRole: '',
  })
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; user: SystemUser | null; newActive: boolean }>({
    open: false, user: null, newActive: false,
  })
  const [detailUser, setDetailUser] = useState<SystemUser | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // ── Fetch danh sách user ──
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const isActive = statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
      const data = await getUsers({
        page: page + 1,         // API 1-indexed
        page_size: pageSize,
        role: roleFilter || undefined,
        search: search || undefined,
        is_active: isActive,
      })
      setUsers(data.users)
      setTotal(data.total)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách user')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, roleFilter, statusFilter, search])

  // ── Fetch thống kê ──
  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      setStats(await getUserStats())
    } catch { /* bỏ qua */ }
    setStatsLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { fetchStats() }, [fetchStats])

  // ── Xử lý đổi role (mở dialog xác nhận) ──
  const openRoleDialog = (user: SystemUser, newRole: string) => {
    if (newRole === user.role) return
    setRoleDialog({ open: true, user, newRole })
  }

  const confirmRoleChange = async () => {
    if (!roleDialog.user) return
    setActionLoading(true)
    try {
      const resp = await updateUserRole(roleDialog.user.user_uid, roleDialog.newRole)
      setSnackbar(resp.message)
      setRoleDialog({ open: false, user: null, newRole: '' })
      fetchUsers()
      fetchStats()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi đổi vai trò')
    } finally {
      setActionLoading(false)
    }
  }

  const cancelRoleChange = () => {
    setRoleDialog({ open: false, user: null, newRole: '' })
  }

  // ── Xử lý đổi status (mở dialog xác nhận) ──
  const openStatusDialog = (user: SystemUser, newActive: boolean) => {
    setStatusDialog({ open: true, user, newActive })
  }

  const confirmStatusChange = async () => {
    if (!statusDialog.user) return
    setActionLoading(true)
    try {
      const resp = await updateUserStatus(statusDialog.user.user_uid, statusDialog.newActive)
      setSnackbar(resp.message)
      setStatusDialog({ open: false, user: null, newActive: false })
      fetchUsers()
      fetchStats()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi đổi trạng thái')
    } finally {
      setActionLoading(false)
    }
  }

  const cancelStatusChange = () => {
    setStatusDialog({ open: false, user: null, newActive: false })
  }

  // ── Filter callbacks — reset page khi thay đổi filter ──
  const handleSearchChange = (v: string) => { setSearch(v); setPage(0) }
  const handleRoleFilter = (v: string) => { setRoleFilter(v); setPage(0) }
  const handleStatusFilter = (v: string) => { setStatusFilter(v); setPage(0) }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        📋 Quản lý Người dùng & Phân quyền
      </Typography>

      {/* Thẻ thống kê */}
      <UserStatsCards stats={stats} loading={statsLoading} />

      {/* Lỗi */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Bộ lọc */}
      <UserFilters
        search={search}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onRoleChange={handleRoleFilter}
        onStatusChange={handleStatusFilter}
      />

      {/* Bảng user — inline role select + status switch */}
      <UserTable
        users={users}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={s => { setPageSize(s); setPage(0) }}
        onRoleChange={openRoleDialog}
        onStatusChange={openStatusDialog}
        onViewDetail={setDetailUser}
        currentUserEmail={currentUser?.email}
      />

      {/* Dialog xác nhận đổi role */}
      <RoleChangeDialog
        open={roleDialog.open}
        user={roleDialog.user}
        newRole={roleDialog.newRole}
        loading={actionLoading}
        onConfirm={confirmRoleChange}
        onCancel={cancelRoleChange}
      />

      {/* Dialog xác nhận đổi status */}
      <StatusChangeDialog
        open={statusDialog.open}
        user={statusDialog.user}
        newActive={statusDialog.newActive}
        loading={actionLoading}
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
      />

      {/* Modal chi tiết user + audit log */}
      <UserDetailModal
        open={Boolean(detailUser)}
        user={detailUser}
        onClose={() => setDetailUser(null)}
      />

      {/* Snackbar thành công */}
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={() => setSnackbar('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snackbar}
      />
    </Box>
  )
}
