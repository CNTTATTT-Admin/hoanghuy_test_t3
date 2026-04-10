/**
 * AppRouter.tsx — Cấu hình React Router cho toàn bộ ứng dụng.
 * AppShell bọc tất cả routes để header + sidebar hiển thị xuyên suốt.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '../layouts/AppShell'
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
import { Notifications } from '../pages/Notifications'

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/check"     element={<CheckTransaction />} />
          <Route path="/alerts"    element={<Alerts />} />
          <Route path="/users"     element={<Users />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings"  element={<Settings />} />
          <Route path="/dashboard/transactions" element={<DashboardTransactions />} />
          <Route path="/dashboard/fraud"        element={<DashboardFraud />} />
          <Route path="/dashboard/fraud-rate"   element={<DashboardFraudRate />} />
          <Route path="/dashboard/risk"         element={<DashboardRiskScore />} />
          <Route path="/notifications"           element={<Notifications />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
