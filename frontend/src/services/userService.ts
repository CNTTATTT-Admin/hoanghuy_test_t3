// frontend/src/services/userService.ts
// API service layer cho quản lý user — tách logic gọi API khỏi component

import { apiGet, apiPut } from './apiClient'

// ── Types ──────────────────────────────────────────────────
export interface SystemUser {
  user_uid: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  is_email_verified: boolean
  created_at: string
  last_login_at: string | null
}

export interface UserListResponse {
  users: SystemUser[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface UserStats {
  total_users: number
  active_users: number
  inactive_users: number
  unverified_users: number
  by_role: Record<string, number>
}

export interface AuditEntry {
  id: number
  target_user_uid: string
  action: string
  old_value: string | null
  new_value: string | null
  changed_by_uid: string | null
  changed_by_email: string | null
  created_at: string
}

// ── Constants ──────────────────────────────────────────────
export const ROLES = ['USER', 'ANALYST', 'ADMIN', 'ML_ENGINEER', 'COMPLIANCE'] as const

export const ROLE_LABELS: Record<string, string> = {
  USER:        'Người dùng',
  ANALYST:     'Chuyên viên phân tích',
  ADMIN:       'Quản trị viên',
  ML_ENGINEER: 'Kỹ sư ML',
  COMPLIANCE:  'Tuân thủ',
}

export const ROLE_COLORS: Record<string, 'default' | 'primary' | 'error' | 'warning' | 'info' | 'success'> = {
  USER:        'default',
  ANALYST:     'info',
  ADMIN:       'error',
  ML_ENGINEER: 'warning',
  COMPLIANCE:  'success',
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  USER:        ['Kiểm tra giao dịch đơn lẻ', 'Xem thông báo cá nhân'],
  ANALYST:     ['Xem và xử lý cảnh báo gian lận', 'Upload batch CSV', 'Xem phân tích'],
  ADMIN:       ['Toàn quyền hệ thống', 'Quản lý người dùng', 'Cài đặt hệ thống'],
  ML_ENGINEER: ['Kiểm tra giao dịch', 'Theo dõi mô hình ML', 'Xem drift monitoring'],
  COMPLIANCE:  ['Xem cảnh báo (chỉ đọc)', 'Xem phân tích', 'Xem audit log'],
}

// ── API calls ──────────────────────────────────────────────

export interface UserListParams {
  page: number       // 1-indexed
  page_size: number
  role?: string
  search?: string
  is_active?: boolean
}

/** Lấy danh sách user phân trang */
export async function getUsers(params: UserListParams): Promise<UserListResponse> {
  const qs = new URLSearchParams()
  qs.set('page', String(params.page))
  qs.set('page_size', String(params.page_size))
  if (params.role) qs.set('role', params.role)
  if (params.search?.trim()) qs.set('search', params.search.trim())
  if (params.is_active !== undefined) qs.set('is_active', String(params.is_active))
  return apiGet<UserListResponse>(`/api/v1/admin/users?${qs}`)
}

/** Lấy thống kê user */
export async function getUserStats(): Promise<UserStats> {
  return apiGet<UserStats>('/api/v1/admin/users/stats')
}

/** Lấy chi tiết user */
export async function getUserDetail(userUid: string): Promise<SystemUser> {
  return apiGet<SystemUser>(`/api/v1/admin/users/${userUid}`)
}

/** Đổi vai trò */
export async function updateUserRole(userUid: string, role: string): Promise<{ message: string }> {
  return apiPut<{ message: string }>(`/api/v1/admin/users/${userUid}/role`, { role })
}

/** Kích hoạt / vô hiệu hóa */
export async function updateUserStatus(userUid: string, isActive: boolean): Promise<{ message: string }> {
  return apiPut<{ message: string }>(`/api/v1/admin/users/${userUid}/status`, { is_active: isActive })
}

/** Lấy audit log */
export async function getUserAuditLog(userUid: string, limit = 50): Promise<{ user_uid: string; email: string; logs: AuditEntry[] }> {
  return apiGet(`/api/v1/admin/users/${userUid}/audit?limit=${limit}`)
}

/** Format thời gian tương đối — "2 giờ trước", "3 ngày trước" */
export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)

  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} giờ trước`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay} ngày trước`
  return date.toLocaleDateString('vi-VN')
}
