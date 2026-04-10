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
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import InsightsIcon from '@mui/icons-material/Insights'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'

interface NavItem {
  label: string
  path: string
  Icon: ComponentType<SvgIconProps>
}

const navItems: NavItem[] = [
  { label: 'Tổng quan',      path: '/',          Icon: DashboardOutlinedIcon },
  { label: 'Kiểm tra GD',   path: '/check',     Icon: ManageSearchIcon },
  { label: 'Cảnh báo',      path: '/alerts',         Icon: NotificationsActiveOutlinedIcon },
  { label: 'Thông báo',     path: '/notifications',  Icon: NotificationsOutlinedIcon },
  { label: 'Phân tích',     path: '/analytics', Icon: InsightsIcon },
  { label: 'Người dùng',    path: '/users',     Icon: PeopleAltOutlinedIcon },
  { label: 'Cài đặt',       path: '/settings',  Icon: SettingsOutlinedIcon },
]

export function Sidebar() {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path)

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
        {navItems.map(({ label, path, Icon }) => {
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
