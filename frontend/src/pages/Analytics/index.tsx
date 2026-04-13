/**
 * Analytics/index.tsx — Trang phân tích hiệu suất mô hình và thống kê gian lận.
 * Màu sắc charts lấy từ theme.palette.* và tokens.risk.* — không hardcode.
 * Dữ liệu thật từ endpoint GET /api/v1/analytics?days=N (Prompt 27).
 */
import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import { apiGet } from '../../services/apiClient'
import { tokens } from '../../theme'

// ─── Kiểu dữ liệu backend (từ Prompt 27 — GET /api/v1/analytics) ─────────────

interface AnalyticsKPI {
  total_transactions:   number
  total_fraud:          number
  fraud_rate_pct:       number
  avg_risk_score:       number
  blocked_count:        number
  false_positive_count: number
  resolution_rate_pct:  number
}

interface FraudByType {
  tx_type:        string
  count:          number
  fraud_count:    number
  fraud_rate_pct: number
}

interface DailyTrend {
  date:           string
  total:          number
  fraud:          number
  false_positive: number
}

interface HourlyPoint {
  hour:        number
  count:       number
  fraud_count: number
}

interface AlertStats {
  open:            number
  investigating:   number
  resolved:        number
  false_positive:  number
  confirmed_fraud: number
}

interface ModelInfo {
  precision:  number
  recall:     number
  f1_score:   number
  auc_roc:    number
  model_name: string
  trained_at: string
}

interface AnalyticsResponse {
  kpi:               AnalyticsKPI
  fraud_by_type:     FraudByType[]
  daily_trend:       DailyTrend[]
  risk_distribution: Record<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', number>
  hourly_heatmap:    HourlyPoint[]
  alert_stats:       AlertStats
  model_info:        ModelInfo
}

// ─── Hook lấy dữ liệu analytics từ một endpoint duy nhất ─────────────────────

function useAnalyticsData(days: number) {
  const [data, setData]       = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    apiGet<AnalyticsResponse>(`/api/v1/analytics?days=${days}`)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [days])

  return { data, loading, error }
}

// ─── Component chính ──────────────────────────────────────────────────────────

export function Analytics() {
  const theme = useTheme()
  const [days, setDays] = useState(30)
  const { data, loading, error } = useAnalyticsData(days)

  // ── Export CSV ──
  const handleExportCSV = () => {
    if (!data) return
    const rows = [
      ['Ngày', 'Tổng GD', 'Gian lận', 'False Positive'],
      ...data.daily_trend.map((d) => [d.date, d.total, d.fraud, d.false_positive]),
    ]
    const csv  = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `analytics_${days}d_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ── Hourly heatmap: đảm bảo đủ 24 điểm ──
  const hours      = Array.from({ length: 24 }, (_, i) => i)
  const heatmapMap = new Map((data?.hourly_heatmap ?? []).map((x) => [x.hour, x]))
  const heatData   = hours.map((h) => heatmapMap.get(h)?.fraud_count ?? 0)

  // ── Risk distribution ──
  const riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
  const riskColors = [tokens.risk.low, tokens.risk.medium, tokens.risk.high, tokens.risk.critical]
  const riskCounts = riskLevels.map((l) => data?.risk_distribution[l] ?? 0)

  // ── Alert stats: fallback nếu chưa có data ──
  const alertStats = data?.alert_stats ?? {
    open: 0, investigating: 0, resolved: 0, false_positive: 0, confirmed_fraud: 0,
  }

  const cardSx = {
    bgcolor:      '#0d1117',
    border:       '1px solid #1e2330',
    borderRadius: '8px',
  } as const

  const axisSx = {
    '& .MuiChartsAxis-line': { stroke: theme.palette.divider },
    '& .MuiChartsAxis-tick': { stroke: theme.palette.divider },
  }

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: 'text.primary', mb: 0.5 }}>Phân tích & Hiệu suất</Typography>
          <Typography variant="body2" color="text.secondary">
            Hiệu suất mô hình ML và thống kê phát hiện gian lận
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {[7, 14, 30, 90].map((d) => (
            <Button
              key={d}
              size="small"
              variant={days === d ? 'contained' : 'outlined'}
              onClick={() => setDays(d)}
              sx={{ minWidth: 56, fontSize: '12px' }}
            >
              {d}N
            </Button>
          ))}
          <Button
            size="small"
            variant="outlined"
            onClick={handleExportCSV}
            disabled={!data || loading}
            startIcon={<DownloadOutlinedIcon />}
            sx={{ fontSize: '12px', borderColor: '#1e2330', color: '#9ca3af' }}
          >
            Xuất CSV
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {error && (
        <Typography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
          Lỗi tải dữ liệu: {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {/* ── Hàng 1: KPI Cards ── */}
        {[
          { label: 'Tổng giao dịch',       value: data ? data.kpi.total_transactions.toLocaleString('vi-VN') : '—',                                                              color: theme.palette.primary.main },
          { label: 'Phát hiện gian lận',    value: data ? `${data.kpi.total_fraud.toLocaleString('vi-VN')} (${data.kpi.fraud_rate_pct.toFixed(2)}%)` : '—',                      color: theme.palette.error.main },
          { label: 'Giao dịch bị chặn',    value: data ? data.kpi.blocked_count.toLocaleString('vi-VN') : '—',                                                                   color: theme.palette.warning.main },
          { label: 'Tỷ lệ giải quyết',     value: data ? `${data.kpi.resolution_rate_pct.toFixed(1)}%` : '—',                                                                    color: theme.palette.success.main },
        ].map(({ label, value, color }) => (
          <Grid key={label} size={{ xs: 6, md: 3 }}>
            <Box sx={{ ...cardSx, p: 2 }}>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>{label}</Typography>
              <Typography variant="h5" sx={{ color, fontWeight: 700, mt: 0.5 }}>{value}</Typography>
            </Box>
          </Grid>
        ))}

        {/* ── Hàng 2: BarChart fraud by type + Model Performance ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={cardSx}>
            <CardHeader
              title={<Typography variant="subtitle1" fontWeight={600}>Gian lận theo loại giao dịch</Typography>}
              subheader={<Typography variant="caption" color="text.secondary">{days} ngày gần nhất</Typography>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: data?.fraud_by_type.map((x) => x.tx_type) ?? [],
                  tickLabelStyle: { fontSize: 11, fill: theme.palette.text.secondary },
                }]}
                yAxis={[{ tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary } }]}
                series={[
                  { data: data?.fraud_by_type.map((x) => x.count)       ?? [], label: 'Tổng GD',  color: theme.palette.primary.main },
                  { data: data?.fraud_by_type.map((x) => x.fraud_count)  ?? [], label: 'Gian lận', color: theme.palette.error.main },
                ]}
                height={260}
                sx={axisSx}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ ...cardSx, height: '100%' }}>
            <CardHeader
              title={<Typography variant="subtitle1" fontWeight={600}>Hiệu suất mô hình</Typography>}
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent>
              {data ? (
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#6b7280', mb: 1.5 }}>
                    {data.model_info.model_name} · Trained {data.model_info.trained_at}
                  </Typography>
                  {[
                    { label: 'Precision',  value: `${(data.model_info.precision * 100).toFixed(1)}%` },
                    { label: 'Recall',     value: `${(data.model_info.recall    * 100).toFixed(1)}%` },
                    { label: 'F1-Score',   value: `${(data.model_info.f1_score  * 100).toFixed(1)}%` },
                    { label: 'AUC-ROC',    value: data.model_info.auc_roc.toFixed(3) },
                    { label: 'Avg Risk',   value: data.kpi.avg_risk_score.toFixed(3) },
                    { label: 'Fraud Rate', value: `${data.kpi.fraud_rate_pct.toFixed(2)}%` },
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">Đang tải...</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Hàng 3: LineChart xu hướng hàng ngày ── */}
        <Grid size={12}>
          <Card variant="outlined" sx={cardSx}>
            <CardHeader
              title={<Typography variant="subtitle1" fontWeight={600}>Xu hướng hàng ngày</Typography>}
              subheader={<Typography variant="caption" color="text.secondary">{days} ngày gần nhất</Typography>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <LineChart
                xAxis={[{
                  scaleType: 'point',
                  data: data?.daily_trend.map((x) => x.date.slice(5)) ?? [],
                  tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary },
                }]}
                yAxis={[{ tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary } }]}
                series={[
                  { data: data?.daily_trend.map((x) => x.fraud)          ?? [], label: 'Gian lận',      color: theme.palette.error.main,   showMark: false },
                  { data: data?.daily_trend.map((x) => x.false_positive)  ?? [], label: 'False Positive', color: theme.palette.warning.main,  showMark: false },
                  { data: data?.daily_trend.map((x) => x.total)           ?? [], label: 'Tổng',           color: theme.palette.primary.main,  showMark: false },
                ]}
                height={280}
                sx={axisSx}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* ── Hàng 4: Risk Distribution + Hourly Heatmap ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={cardSx}>
            <CardHeader
              title={<Typography variant="subtitle1" fontWeight={600}>Phân phối mức độ rủi ro</Typography>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <BarChart
                layout="horizontal"
                yAxis={[{
                  scaleType: 'band',
                  data: [...riskLevels],
                  tickLabelStyle: { fontSize: 11, fill: theme.palette.text.secondary },
                }]}
                xAxis={[{ tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary } }]}
                series={riskLevels.map((level, i) => ({
                  data:  [riskCounts[i]],
                  label: level,
                  color: riskColors[i],
                }))}
                height={180}
                sx={axisSx}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={cardSx}>
            <CardHeader
              title={<Typography variant="subtitle1" fontWeight={600}>Gian lận theo giờ (24h)</Typography>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: hours.map((h) => `${h}h`),
                  tickLabelStyle: { fontSize: 9, fill: theme.palette.text.secondary },
                }]}
                yAxis={[{ tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary } }]}
                series={[{ data: heatData, label: 'Fraud theo giờ', color: theme.palette.error.main }]}
                height={180}
                sx={axisSx}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* ── Hàng 5: Alert Status Stacked BarChart ── */}
        <Grid size={12}>
          <Card variant="outlined" sx={cardSx}>
            <CardHeader
              title={<Typography variant="subtitle1" fontWeight={600}>Trạng thái cảnh báo</Typography>}
              subheader={<Typography variant="caption" color="text.secondary">Phân bố theo trạng thái xử lý</Typography>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: ['Trạng thái cảnh báo'],
                  tickLabelStyle: { fontSize: 11, fill: theme.palette.text.secondary },
                }]}
                yAxis={[{ tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary } }]}
                series={[
                  { data: [alertStats.open],            label: 'Đang mở',           color: '#818cf8', stack: 'total' },
                  { data: [alertStats.investigating],   label: 'Điều tra',           color: '#f59e0b', stack: 'total' },
                  { data: [alertStats.resolved],        label: 'Đã giải quyết',     color: '#22c55e', stack: 'total' },
                  { data: [alertStats.false_positive],  label: 'False Positive',     color: '#6b7280', stack: 'total' },
                  { data: [alertStats.confirmed_fraud], label: 'Xác nhận gian lận', color: '#ef4444', stack: 'total' },
                ]}
                height={200}
                sx={axisSx}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
