// Thẻ thống kê tóm tắt — Tổng, Hoạt động, Bị khóa, Chưa xác thực

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import GroupIcon from '@mui/icons-material/Group'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BlockIcon from '@mui/icons-material/Block'
import PendingIcon from '@mui/icons-material/Pending'
import type { UserStats } from '../../../services/userService'

interface Props {
  stats: UserStats | null
  loading?: boolean
}

const cards = [
  { key: 'total_users',      label: 'Tổng người dùng',    color: '#1976d2', icon: GroupIcon },
  { key: 'active_users',     label: 'Đang hoạt động',     color: '#2e7d32', icon: CheckCircleIcon },
  { key: 'inactive_users',   label: 'Đã vô hiệu hóa',    color: '#d32f2f', icon: BlockIcon },
  { key: 'unverified_users', label: 'Chưa xác thực email', color: '#ed6c02', icon: PendingIcon },
] as const

export default function UserStatsCards({ stats, loading }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      {cards.map(({ key, label, color, icon: Icon }) => (
        <Paper
          key={key}
          elevation={1}
          sx={{
            px: 3, py: 2, minWidth: 180, flex: '1 1 180px',
            display: 'flex', alignItems: 'center', gap: 2,
          }}
        >
          <Icon sx={{ fontSize: 36, color }} />
          <Box>
            {loading || !stats ? (
              <Skeleton width={40} height={36} />
            ) : (
              <Typography variant="h5" fontWeight={700} color={color}>
                {stats[key]}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  )
}
