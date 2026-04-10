import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'

// Màu chấm cho từng lý do — xoay vòng theo thứ tự
const DOT_COLORS = ['#dc2626', '#eab308', '#f97316', '#6366f1', '#22c55e']

interface ReasoningLogProps {
  reasons: string[]
}

export function ReasoningLog({ reasons }: ReasoningLogProps) {
  return (
    <Box
      sx={{
        bgcolor: '#0d1117',
        border: '1px solid #1e2330',
        borderRadius: '8px',
        p: 2,
        height: '100%',
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
          NHẬT KÝ LÝ LUẬN AI
        </Typography>
        <IconButton size="small" sx={{ color: '#6b7280' }}>
          <ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      {/* Reason items — từ API */}
      {reasons.length === 0 ? (
        <Typography sx={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>
          Không phát hiện yếu tố bất thường
        </Typography>
      ) : (
        reasons.map((reason, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              gap: 1.5,
              py: 1,
              borderBottom: i < reasons.length - 1 ? '1px solid #1e2330' : 'none',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: DOT_COLORS[i % DOT_COLORS.length],
                flexShrink: 0,
                mt: 0.6,
              }}
            />
            <Typography sx={{ fontSize: '13px', color: '#fff', lineHeight: 1.5 }}>
              {reason}
            </Typography>
          </Box>
        ))
      )}
    </Box>
  )
}
