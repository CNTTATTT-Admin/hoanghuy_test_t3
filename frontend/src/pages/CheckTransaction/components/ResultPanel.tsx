import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import BlockIcon from '@mui/icons-material/Block'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { tokens } from '../../../theme'
import type { CheckResult, TransactionDetail } from '../types'
import { RiskGauge } from './RiskGauge'
import { ReasoningLog } from './ReasoningLog'
import { CorrelationMap } from './CorrelationMap'
import { TransactionDetailPanel } from '../../../components/TransactionDetailPanel'

function getRiskColor(result: CheckResult): string {
  return tokens.risk[result.riskLevel]
}

/* ─── Decision config ─── */
const DECISION_CONFIG = {
  BLOCKED: {
    icon: <BlockIcon sx={{ fontSize: 18 }} />,
    label: 'GIAO DỊCH ĐÃ BỊ CHẶN',
    badgeBg: '#7f1d1d',
    badgeColor: '#ff6b6b',
    bannerBg: '#450a0a',
    bannerBorder: '#dc2626',
    title: 'Giao dịch đã bị chặn tự động',
    subtitle: 'Hệ thống đã ngăn chặn giao dịch này trước khi thực thi. Tài khoản có thể bị đánh dấu để giám sát.',
  },
  PENDING: {
    icon: <WarningAmberIcon sx={{ fontSize: 18 }} />,
    label: 'CHỜ XÉT DUYỆT THỦ CÔNG',
    badgeBg: '#78350f',
    badgeColor: '#fbbf24',
    bannerBg: '#451a0322',
    bannerBorder: '#d97706',
    title: 'Giao dịch bị tạm giữ để xét duyệt',
    subtitle: 'Mức rủi ro nằm trong vùng xám. Giao dịch cần được nhân viên phê duyệt thủ công trước khi thực thi.',
  },
  APPROVED: {
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />,
    label: 'GIAO DỊCH ĐƯỢC PHÊ DUYỆT',
    badgeBg: '#14532d',
    badgeColor: '#4ade80',
    bannerBg: '#052e16',
    bannerBorder: '#16a34a',
    title: 'Giao dịch hợp lệ',
    subtitle: 'Không phát hiện dấu hiệu bất thường. Giao dịch được phép thực thi.',
  },
} as const

/* ─── Empty state ─── */
export function ResultEmpty() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 420,
        gap: 1.5,
      }}
    >
      <ShieldOutlinedIcon sx={{ fontSize: 64, opacity: 0.15, color: '#6b7280' }} />
      <Typography sx={{ color: '#4b5563', fontSize: '13px' }}>
        Chạy đánh giá chẩn đoán để xem kết quả
      </Typography>
    </Box>
  )
}

/* ─── Result panel ─── */
interface ResultPanelProps {
  result: CheckResult
  detail?: TransactionDetail | null
}

export function ResultPanel({ result, detail }: ResultPanelProps) {
  const color = getRiskColor(result)
  const cfg = DECISION_CONFIG[result.decision] ?? DECISION_CONFIG.APPROVED

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* ── Decision banner — hiển thị nổi bật BLOCKED/PENDING/APPROVED ── */}
      <Box
        sx={{
          bgcolor: cfg.bannerBg,
          border: `2px solid ${cfg.bannerBorder}`,
          borderRadius: '10px',
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48, height: 48,
            borderRadius: '50%',
            bgcolor: cfg.badgeBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cfg.badgeColor,
            flexShrink: 0,
            fontSize: 24,
          }}
        >
          {cfg.icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Chip
            label={cfg.label}
            size="small"
            sx={{
              bgcolor: cfg.badgeBg,
              color: cfg.badgeColor,
              fontWeight: 800,
              fontSize: '12px',
              letterSpacing: '0.05em',
              mb: 0.5,
              border: `1px solid ${cfg.badgeColor}44`,
            }}
          />
          <Typography sx={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600, mt: 0.5 }}>
            {cfg.title}
          </Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '12px', mt: 0.5 }}>
            {cfg.subtitle}
          </Typography>
        </Box>
      </Box>

      {/* ── Block/Review reason — chi tiết lý do ── */}
      {result.blockReason && (
        <Box
          sx={{
            bgcolor: '#450a0a',
            border: '1px solid #991b1b',
            borderRadius: '8px',
            p: 2,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <BlockIcon sx={{ color: '#f87171', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ color: '#fca5a5', fontSize: '12px', fontWeight: 700, mb: 0.5 }}>
              LÝ DO CHẶN
            </Typography>
            <Typography sx={{ color: '#fecaca', fontSize: '13px', lineHeight: 1.6 }}>
              {result.blockReason}
            </Typography>
          </Box>
        </Box>
      )}
      {result.reviewReason && !result.blockReason && (
        <Box
          sx={{
            bgcolor: '#451a0333',
            border: '1px solid #92400e',
            borderRadius: '8px',
            p: 2,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <WarningAmberIcon sx={{ color: '#fbbf24', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ color: '#fde68a', fontSize: '12px', fontWeight: 700, mb: 0.5 }}>
              LÝ DO CẦN XÉT DUYỆT
            </Typography>
            <Typography sx={{ color: '#fef3c7', fontSize: '13px', lineHeight: 1.6 }}>
              {result.reviewReason}
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Top section — Risk gauge + info ── */}
      <Box
        sx={{
          bgcolor: '#0d1117',
          border: `1px solid ${color}`,
          borderRadius: '8px',
          p: 2.5,
          position: 'relative',
        }}
      >
        {/* Badge */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: '6px',
            mb: 2,
            bgcolor: result.isFraud ? '#7f1d1d' : '#14532d',
            color: result.isFraud ? '#ff6b6b' : '#4ade80',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          {result.isFraud ? '⚠ PHÁT HIỆN GIAN LẬN' : '✓ GIAO DỊCH HỢP LỆ'}
        </Box>

        {/* 2-column: Gauge + Info */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 3,
          }}
        >
          {/* Left — RiskGauge */}
          <Box sx={{ flexShrink: 0 }}>
            <RiskGauge score={result.riskScore} color={color} />
          </Box>

          {/* Right — Info */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#fff',
                mb: 1,
              }}
            >
              {result.isFraud ? 'Bất thường nghiêm trọng' : 'Giao dịch hợp lệ'}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#9ca3af', mb: 2.5, lineHeight: 1.6 }}
            >
              {result.explanation}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Bottom section — 2 equal columns ── */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ReasoningLog reasons={result.reasons} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CorrelationMap />
        </Grid>
      </Grid>

      {/* ── Chi tiết giao dịch ── */}
      {detail && (
        <Box
          sx={{
            bgcolor: '#0d1117',
            border: '1px solid #1e2330',
            borderRadius: '8px',
            p: 2.5,
          }}
        >
          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.7px',
              mb: 2,
            }}
          >
            Chi tiết giao dịch
          </Typography>
          <TransactionDetailPanel tx={detail} />
        </Box>
      )}

      {/* ── Footer bar ── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pt: 1.5,
          borderTop: '1px solid #1e2330',
        }}
      >
        <Typography sx={{ fontSize: '11px', color: '#4b5563', fontFamily: 'monospace' }}>
          TẦNG XỬ LÝ · Suy luận siêu sâu v4
        </Typography>
        <Typography sx={{ fontSize: '11px', color: '#22c55e', fontFamily: 'monospace' }}>
          Độ tin cậy: {(result.probability * 100).toFixed(2)}%
        </Typography>
      </Box>
    </Box>
  )
}
