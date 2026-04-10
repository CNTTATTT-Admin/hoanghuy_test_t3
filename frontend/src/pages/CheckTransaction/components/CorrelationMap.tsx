import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined'

export function CorrelationMap() {
  return (
    <Box
      sx={{
        bgcolor: '#0d1117',
        border: '1px solid #1e2330',
        borderRadius: '8px',
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#6b7280',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}
        >
          BẢN ĐỒ TƯƠNG QUAN
        </Typography>
        <IconButton size="small" sx={{ color: '#6b7280' }}>
          <StarOutlineOutlinedIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      {/* SVG Map */}
      <Box
        sx={{
          width: '100%',
          height: 120,
          bgcolor: '#080a0f',
          borderRadius: '6px',
          overflow: 'hidden',
          mb: 1.5,
        }}
      >
        <svg width="100%" height="120" viewBox="0 0 280 120">
          <defs>
            <filter id="blur-line">
              <feGaussianBlur stdDeviation="1" />
            </filter>
          </defs>
          {/* Connections */}
          <line x1="140" y1="60" x2="40" y2="30" stroke="#1e2330" strokeWidth="1" filter="url(#blur-line)" />
          <line x1="140" y1="60" x2="220" y2="25" stroke="#1e2330" strokeWidth="1" filter="url(#blur-line)" />
          <line x1="140" y1="60" x2="60" y2="95" stroke="#1e2330" strokeWidth="1" filter="url(#blur-line)" />
          <line x1="140" y1="60" x2="250" y2="85" stroke="#1e2330" strokeWidth="1" filter="url(#blur-line)" />
          <line x1="140" y1="60" x2="180" y2="100" stroke="#1e2330" strokeWidth="1" filter="url(#blur-line)" />
          <line x1="140" y1="60" x2="95" y2="20" stroke="#1e2330" strokeWidth="1" filter="url(#blur-line)" />

          {/* Outer nodes */}
          <circle cx="40" cy="30" r="4" fill="#6366f1" />
          <circle cx="220" cy="25" r="4" fill="#6366f1" />
          <circle cx="60" cy="95" r="4" fill="#6366f1" />
          <circle cx="250" cy="85" r="4" fill="#6366f1" />
          <circle cx="180" cy="100" r="4" fill="#6366f1" />
          <circle cx="95" cy="20" r="4" fill="#6366f1" />

          {/* Center highlight node */}
          <circle cx="140" cy="60" r="7" fill="#dc2626" />

          {/* Labels */}
          <text x="225" y="20" fill="#4b5563" fontSize="8" fontFamily="monospace">Singapore</text>
          <text x="42" y="25" fill="#4b5563" fontSize="8" fontFamily="monospace">Moscow, RU</text>
        </svg>
      </Box>

      {/* Footer text */}
      <Typography sx={{ fontSize: '11px', color: '#4b5563', lineHeight: 1.4 }}>
        Hệ thống phát hiện tham chiếu chéo với 14 chữ ký botnet đã biết
      </Typography>
    </Box>
  )
}
