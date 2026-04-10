/**
 * AppShell.tsx — Layout wrapper toàn app.
 * Chỉ cung cấp vùng trống sau header + sidebar; mỗi trang tự quyết định layout nội dung.
 * Mọi kích thước offset đều lấy từ theme.layout.* — không hardcode.
 */
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header cố định trên cùng, z-index cao hơn Sidebar */}
      <Header />

      {/* Sidebar cố định bên trái, tự offset bên dưới header */}
      <Sidebar />

      {/* Vùng nội dung chính — mỗi trang tự do bố trí bên trong */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: `${theme.layout.headerHeight}px`,
          p: `${theme.layout.contentPadding}px`,
          minHeight: `calc(100vh - ${theme.layout.headerHeight}px)`,
          overflow: 'auto',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
