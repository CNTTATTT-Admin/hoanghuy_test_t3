// frontend/src/components/ProtectedRoute.tsx
// Route guard — kiểm tra đã đăng nhập + role được phép

import { Navigate, useLocation } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { useAuth } from '../hooks/useAuth'
import { Forbidden } from '../pages/Auth/Forbidden'
import type { UserRole } from '../services/authService'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Danh sách role được phép; nếu không truyền → chỉ cần đăng nhập */
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Chưa đăng nhập → về trang login, lưu redirect
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Có role filter nhưng user không đủ quyền → hiển thị trang 403
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Forbidden />
  }

  return <>{children}</>
}
