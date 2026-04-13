// frontend/src/components/RoleGuard.tsx
// Ẩn/hiện phần tử UI theo role — dùng trong component con

import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../services/authService'

interface Props {
  /** Danh sách role được phép thấy nội dung này */
  allowedRoles: UserRole[]
  children: ReactNode
  /** Nội dung hiển thị khi không đủ quyền (mặc định: null — ẩn hoàn toàn) */
  fallback?: ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback = null }: Props) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
