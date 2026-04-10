/**
 * TransactionDetailPanel.tsx — Panel hiển thị chi tiết giao dịch.
 * Dùng chung cho Dashboard modal và CheckTransaction result.
 */
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import { TxTypeBadge } from './TxTypeBadge'
import type { TransactionDetail } from '../pages/CheckTransaction/types'

interface Props {
  tx: TransactionDetail
  /** Màu nền — mặc định trong suốt (dùng được trên cả sáng lẫn tối) */
  dark?: boolean
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: '10px',
        fontWeight: 700,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.7px',
        mb: 0.5,
      }}
    >
      {children}
    </Typography>
  )
}

function Value({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <Typography
      sx={{
        fontSize: '13px',
        color: '#f1f5f9',
        fontFamily: mono ? 'monospace' : undefined,
        wordBreak: 'break-all',
      }}
    >
      {children}
    </Typography>
  )
}

const DECISION_CHIP: Record<string, { bg: string; color: string }> = {
  BLOCKED:  { bg: '#7f1d1d33', color: '#f87171' },
  PENDING:  { bg: '#78350f33', color: '#fbbf24' },
  APPROVED: { bg: '#14532d33', color: '#4ade80' },
}

export function TransactionDetailPanel({ tx, dark = true }: Props) {
  const decisionStyle = DECISION_CHIP[tx.decision ?? ''] ?? { bg: '#1e293b', color: '#94a3b8' }

  return (
    <Box sx={{ mt: 0 }}>
      <Grid container spacing={2}>

        {/* Mã giao dịch — full width */}
        <Grid size={{ xs: 12 }}>
          <Label>Mã giao dịch</Label>
          <Value mono>{tx.transaction_id ?? '—'}</Value>
        </Grid>

        {/* Loại giao dịch */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Label>Loại giao dịch</Label>
          <TxTypeBadge type={tx.type} showFull />
        </Grid>

        {/* Số tiền */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Label>Số tiền</Label>
          <Value>
            {tx.amount != null
              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount)
              : '—'}
          </Value>
        </Grid>

        {/* Người gửi */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Label>Người gửi (Tài khoản nguồn)</Label>
          <Value mono>{tx.name_orig ?? '—'}</Value>
        </Grid>

        {/* Người nhận */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Label>Người nhận (Tài khoản đích)</Label>
          <Value mono>{tx.name_dest ?? '—'}</Value>
        </Grid>

        {/* Xác suất gian lận */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Label>Xác suất gian lận</Label>
          <Typography
            sx={{
              fontSize: '20px',
              fontWeight: 700,
              color:
                (tx.fraud_score ?? 0) >= 0.9 ? '#f87171' :
                (tx.fraud_score ?? 0) >= 0.7 ? '#fb923c' :
                (tx.fraud_score ?? 0) >= 0.4 ? '#fbbf24' :
                                               '#4ade80',
            }}
          >
            {tx.fraud_score != null ? `${(tx.fraud_score * 100).toFixed(1)}%` : '—'}
          </Typography>
        </Grid>

        {/* Quyết định */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Label>Quyết định</Label>
          <Chip
            label={tx.decision ?? '—'}
            size="small"
            sx={{
              bgcolor: decisionStyle.bg,
              color: decisionStyle.color,
              border: `1px solid ${decisionStyle.color}44`,
              fontWeight: 700,
              fontSize: '11px',
            }}
          />
        </Grid>

        {/* Cảnh báo giá trị cao — chỉ hiện khi có */}
        {tx.high_value_reason && (
          <Grid size={{ xs: 12 }}>
            <Label>Lý do cảnh báo giá trị cao</Label>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                bgcolor: '#451a0333',
                border: '1px solid #92400e',
                borderRadius: '6px',
                px: 1.5,
                py: 1,
              }}
            >
              <Typography sx={{ color: '#fbbf24', fontSize: '13px', lineHeight: 1 }}>⚠️</Typography>
              <Typography sx={{ color: '#fde68a', fontSize: '12px' }}>{tx.high_value_reason}</Typography>
            </Box>
          </Grid>
        )}

        {/* Yếu tố rủi ro — chỉ hiện khi có */}
        {tx.key_factors.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Label>Yếu tố rủi ro phát hiện</Label>
            <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
              {tx.key_factors.map((factor: string, i: number) => (
                <Box
                  component="li"
                  key={i}
                  sx={{ display: 'flex', gap: 1, mb: 0.5 }}
                >
                  <Typography sx={{ color: '#f87171', fontSize: '12px', lineHeight: 1.5 }}>•</Typography>
                  <Typography sx={{ color: '#fca5a5', fontSize: '12px', lineHeight: 1.5 }}>{factor}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        )}

        {/* Thời gian xử lý */}
        {tx.processed_at && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ pt: 1.5, borderTop: '1px solid #1e293b' }}>
              <Label>Thời gian xử lý</Label>
              <Value>
                {new Date(tx.processed_at).toLocaleString('vi-VN', {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                })}
              </Value>
            </Box>
          </Grid>
        )}

      </Grid>
    </Box>
  )
}
