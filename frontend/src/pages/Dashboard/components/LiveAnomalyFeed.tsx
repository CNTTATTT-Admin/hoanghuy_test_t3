/**
 * LiveAnomalyFeed.tsx — Bảng giao dịch bất thường theo thời gian thực.
 * Màu mức rủi ro lấy từ theme.tokens.risk.* — không hardcode hex.
 */
import { useState, useCallback } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { useTheme, alpha } from '@mui/material/styles'
import { tokens } from '../../../theme'
import { apiGet } from '../../../services/apiClient'
import { usePolling } from '../../../hooks/usePolling'
import { TxTypeBadge } from '../../../components/TxTypeBadge'

type RiskLevel  = 'low' | 'medium' | 'high' | 'critical'
type TxStatus   = 'pending'
type TxType     = 'PAYMENT' | 'TRANSFER' | 'CASH_OUT' | 'CASH_IN' | 'DEBIT'

interface AnomalyRecord {
  id:         string
  type:       TxType
  amount:     number
  riskLevel:  RiskLevel
  riskScore:  number
  timestamp:  string
  status:     TxStatus
}

function inferRiskLevel(score: number): RiskLevel {
  if (score >= 0.9) return 'critical'
  if (score >= 0.7) return 'high'
  if (score >= 0.4) return 'medium'
  return 'low'
}

const riskLabels: Record<RiskLevel, string> = {
  low:      'Thấp',
  medium:   'Trung bình',
  high:     'Cao',
  critical: 'Nguy hiểm',
}
const statusLabels: Record<TxStatus, string> = { pending: 'Chờ xử lý' }
const statusPalette: Record<TxStatus, 'warning'> = { pending: 'warning' }
// Component Chip hiển thị mức rủi ro với màu sắc từ theme.tokens.risk.* và style tùy chỉnh
function RiskChip({ level }: { level: RiskLevel }) {
  const theme = useTheme()
  const color = tokens.risk[level]
  return (
    <Chip
      label={riskLabels[level]}
      size="small"
      sx={{
        bgcolor:     alpha(color, 0.14),
        color,
        borderColor: alpha(color, 0.35),
        border:      1,
        fontWeight:  600,
        fontSize:    '0.68rem',
        height:      22,
      }}
    />
  )
}
// Component chính LiveAnomalyFeed, hiển thị bảng giao dịch bất thường với polling mỗi 15 giây
export function LiveAnomalyFeed() {
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]) 
  const [loading, setLoading]     = useState(true) 
  const [error, setError]         = useState<string | null>(null)

  // Dùng inference-history thay vì alerts — tránh vấn đề filter status sai
  const fetchAnomalies = useCallback(() => {
    apiGet<InferenceHistoryResponse>(
      '/api/v1/inference-history?is_fraud=true&today_only=true&sort_by=risk_score&sort_dir=desc&limit=8'
    )
      .then((data) => {
        const mapped = (data.transactions ?? []).map<AnomalyRecord>((r) => ({
          id:        r.user_id || r.request_id || '—',
          type:      (r.transaction_type ?? 'TRANSFER') as TxType,
          amount:    r.amount ?? 0,
          riskLevel: inferRiskLevel(r.risk_score),
          riskScore: Math.round(r.risk_score * 100),
          timestamp: new Date(r.created_at).toLocaleTimeString('vi-VN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          }),
          status: 'pending',
        }))
        setAnomalies(mapped)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Polling mỗi 15 giây, gọi ngay lần đầu khi mount
  usePolling(fetchAnomalies, 15_000, true)

  return (
    <Card variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiberManualRecordIcon sx={{ color: 'success.main', fontSize: 10 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Luồng bất thường thời gian thực
            </Typography>
            {/* Chấm xanh nhấp nháy — chỉ báo đang live polling */}
            <Box
              sx={{
                width: 8, height: 8, borderRadius: '50%',
                bgcolor: 'success.main',
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%':       { opacity: 0.3 },
                },
              }}
            />
          </Box>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            Các giao dịch có điểm rủi ro cao nhất trong 1 giờ qua
          </Typography>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {/* Skeleton loading — 6 dòng giả */}
        {loading && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
        )}

        {/* Fallback khi lỗi hoặc không có dữ liệu */}
        {!loading && (error || anomalies.length === 0) && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {error ? `Lỗi tải dữ liệu: ${error}` : 'Không có dữ liệu bất thường'}
            </Typography>
          </Box>
        )}

        {/* Bảng dữ liệu */}
        {!loading && !error && anomalies.length > 0 && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { borderColor: 'divider', color: 'text.disabled', fontSize: '0.7rem', fontWeight: 700, letterSpacing: 0.8 } }}>
                <TableCell>MÃ GD</TableCell>
                <TableCell>LOẠI</TableCell>
                <TableCell align="right">SỐ TIỀN (VNĐ)</TableCell>
                <TableCell align="center">RỦI RO</TableCell>
                <TableCell align="center">ĐIỂM</TableCell>
                <TableCell align="center">TRẠNG THÁI</TableCell>
                <TableCell align="right">THỜI GIAN</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {anomalies.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    cursor: 'pointer',
                    '& td': { borderColor: 'divider', color: 'text.primary', fontSize: '0.82rem' },
                    '&:hover': { bgcolor: 'action.hover' },
                    '&:last-child td': { border: 0 },
                  }}
                >
                  <TableCell sx={{ fontFamily: 'monospace', color: 'primary.main !important' }}>
                    {row.id}
                  </TableCell>
                  <TableCell><TxTypeBadge type={row.type} /></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {row.amount.toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell align="center">
                    <RiskChip level={row.riskLevel} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    {row.riskScore}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={statusLabels[row.status]}
                      size="small"
                      color={statusPalette[row.status]}
                      variant="outlined"
                      sx={{ fontSize: '0.68rem', height: 22, fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary !important', fontFamily: 'monospace' }}>
                    {row.timestamp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        )}
      </CardContent>
    </Card>
  )
}
