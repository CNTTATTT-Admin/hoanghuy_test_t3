/**
 * Sidebar.tsx — Thanh điều hướng cố định bên trái.
 * Chiều rộng và top offset lấy từ theme.layout.* — không hardcode.
 */
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { useTheme, alpha } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router-dom'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import type { ComponentType } from 'react'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import InsightsIcon from '@mui/icons-material/Insights'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../services/authService'

interface NavItem {
  label: string
  path: string
  Icon: ComponentType<SvgIconProps>
  /** Role nào được thấy mục này; undefined = tất cả */
  roles?: UserRole[]
}

const navItems: NavItem[] = [
  { label: 'Tổng quan',      path: '/',               Icon: DashboardOutlinedIcon },
  { label: 'Kiểm tra GD',   path: '/check',           Icon: ManageSearchIcon, roles: ['USER', 'ANALYST', 'ADMIN', 'ML_ENGINEER'] },
  { label: 'Cảnh báo',       path: '/alerts',          Icon: NotificationsActiveOutlinedIcon, roles: ['USER', 'ANALYST', 'ADMIN', 'COMPLIANCE'] },
  { label: 'Phân tích',     path: '/analytics',        Icon: InsightsIcon, roles: ['ANALYST', 'ADMIN', 'ML_ENGINEER', 'COMPLIANCE'] },
  { label: 'Quản lý TK',   path: '/admin/users',      Icon: AdminPanelSettingsOutlinedIcon, roles: ['ADMIN'] },
  { label: 'Cài đặt',       path: '/settings',         Icon: SettingsOutlinedIcon, roles: ['ADMIN'] },
]

export function Sidebar() {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path)

  // Lọc nav items theo role của user
  const visibleItems = navItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  )

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: theme.layout.sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: theme.layout.sidebarWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          borderRight: 1,
          borderColor: 'divider',
          top: theme.layout.headerHeight,
          height: `calc(100% - ${theme.layout.headerHeight}px)`,
        },
      }}
    >
      {/* Tiêu đề menu */}
      <Box sx={{ pt: 2.5, pb: 1, px: 2.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            fontWeight: 700,
            letterSpacing: 1.2,
            fontSize: '0.65rem',
          }}
        >
          ĐIỀU HƯỚNG
        </Typography>
      </Box>

      {/* Danh sách nav items */}
      <List sx={{ px: 1.5, flexGrow: 1 }}>
        {visibleItems.map(({ label, path, Icon }) => {
          const active = isActive(path)
          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(path)}
                sx={{
                  borderRadius: `${theme.shape.borderRadius}px`,
                  py: 1,
                  px: 1.5,
                  bgcolor: active
                    ? alpha(theme.palette.primary.main, 0.12)
                    : 'transparent',
                  borderLeft: active ? 3 : 0,
                  borderColor: 'primary.main',
                  pl: active ? 1.25 : 1.5,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.07),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <Icon
                    sx={{
                      color: active ? 'primary.main' : 'text.secondary',
                      fontSize: 20,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'primary.main' : 'text.secondary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2, px: 2.5 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
          FraudDetect v1.0.0
        </Typography>
      </Box>
    </Drawer>
  )
}
