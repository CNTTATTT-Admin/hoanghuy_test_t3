/**
 * AppRouter.tsx — Cấu hình React Router cho toàn bộ ứng dụng.
 * Trang auth (Login/Register/Verify) không dùng AppShell.
 * Trang chính bọc trong ProtectedRoute + AppShell.
 *
 * Ma trận quyền — xem Prompt 19 để biết chi tiết đầy đủ.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '../layouts/AppShell'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Dashboard } from '../pages/Dashboard/'
import { CheckTransaction } from '../pages/CheckTransaction'
import { Alerts } from '../pages/Alerts'
import { Users } from '../pages/Users'
import { Analytics } from '../pages/Analytics'
import { Settings } from '../pages/Settings'
import { DashboardTransactions } from '../pages/Dashboard/sub-pages/DashboardTransactions'
import { DashboardFraud }         from '../pages/Dashboard/sub-pages/DashboardFraud'
import { DashboardFraudRate }     from '../pages/Dashboard/sub-pages/DashboardFraudRate'
import { DashboardRiskScore }     from '../pages/Dashboard/sub-pages/DashboardRiskScore'
import { Login } from '../pages/Auth/Login'
import { Register } from '../pages/Auth/Register'
import { VerifyEmail } from '../pages/Auth/VerifyEmail'
import { Forbidden } from '../pages/Auth/Forbidden'
import { AdminUsers } from '../pages/AdminUsers'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Auth routes — không cần đăng nhập, không dùng AppShell ── */}
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* ── Protected routes — cần đăng nhập + AppShell ── */}
        <Route path="/*" element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                {/* Dashboard — tất cả role */}
                <Route path="/"          element={<Dashboard />} />
                <Route path="/dashboard/transactions" element={<DashboardTransactions />} />
                <Route path="/dashboard/fraud"        element={<DashboardFraud />} />
                <Route path="/dashboard/fraud-rate"   element={<DashboardFraudRate />} />
                <Route path="/dashboard/risk"         element={<DashboardRiskScore />} />

                {/* Kiểm tra GD — USER, ANALYST, ADMIN, ML_ENGINEER */}
                <Route path="/check" element={
                  <ProtectedRoute allowedRoles={['USER', 'ANALYST', 'ADMIN', 'ML_ENGINEER']}>
                    <CheckTransaction />
                  </ProtectedRoute>
                } />

                {/* Cảnh báo — ANALYST, ADMIN, COMPLIANCE "tạm thời không dùng đến phần này" */}
                <Route path="/alerts" element={
                  <ProtectedRoute allowedRoles={['ANALYST', 'ADMIN', 'COMPLIANCE']}>
                    <Alerts />
                  </ProtectedRoute>
                } />

                {/* Thông báo — redirect về / (feature đã gom vào header bell) */}

                {/* Phân tích — ANALYST, ADMIN, ML_ENGINEER, COMPLIANCE */}
                <Route path="/analytics" element={
                  <ProtectedRoute allowedRoles={['ANALYST', 'ADMIN', 'ML_ENGINEER', 'COMPLIANCE']}>
                    <Analytics />
                  </ProtectedRoute>
                } />

                {}
                <Route path="/users" element={
                  <ProtectedRoute allowedRoles={['ANALYST', 'ADMIN', 'COMPLIANCE']}>
                    <Users />
                  </ProtectedRoute>
                } />

                {/* Quản lý tài khoản hệ thống — ADMIN only */}
                <Route path="/admin/users" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUsers />
                  </ProtectedRoute>
                } />

                {/* Cài đặt — ADMIN only */}
                <Route path="/settings" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Settings />
                  </ProtectedRoute>
                } />

                {/* 403 */}
                <Route path="/forbidden" element={<Forbidden />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
      
