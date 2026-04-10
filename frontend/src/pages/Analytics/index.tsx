/**
 * Analytics/index.tsx — Trang phân tích hiệu suất mô hình và thống kê gian lận.
 * Màu sắc charts lấy từ theme.palette.* và theme.tokens.* — không hardcode.
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
import { useTheme } from '@mui/material/styles'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { apiGet } from '../../services/apiClient'

// ─── Dữ liệu placeholder (fallback khi backend offline) ──────────────────────
const fraudByTypeSeries = {
  labels: ['PAYMENT', 'TRANSFER', 'CASH_OUT', 'CASH_IN', 'DEBIT'],
  counts: [38, 54, 29, 8, 13],
}

const weeklyFraudTrend = {
  weeks: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6', 'Tuần 7', 'Tuần 8'],
  detected: [128, 142, 119, 165, 137, 150, 129, 142],
  falsePos: [21, 18, 22, 25, 17, 20, 19, 18],
}

// ─── Kiểu dữ liệu backend ────────────────────────────────────────────────────
interface BackendAlert {
  type:       string
  status:     string
  risk_score: number
  created_at: string
}

interface AnalyticsData {
  fraudByType: { label: string; count: number }[]
  weeklyTrend: { week: string; detected: number; falsePos: number }[]
  stats: {
    totalRequests:       number
    fraudDetected:       number
    avgProcessingTimeMs: number
  }
}

// ─── Hook lấy dữ liệu analytics từ backend ───────────────────────────────────
function useAnalyticsData() {
  const [data, setData]       = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      apiGet<{ total_requests: number; fraud_detected: number; average_processing_time: number }>('/api/v1/stats'), // Endpoint thống kê tổng quan
      apiGet<{ alerts: BackendAlert[] }>('/api/v1/alerts?limit=200'), // Endpoint lấy danh sách alert gần nhất (giả định có hỗ trợ phân trang / limit)
    ])
      .then(([stats, alertsRes]) => {
        const alerts = alertsRes.alerts ?? []

        // ── Gian lận theo loại giao dịch ──
        const typeMap = new Map<string, number>()
        alerts.forEach((a) => {
          const t = (a.type ?? 'UNKNOWN').toUpperCase()
          typeMap.set(t, (typeMap.get(t) ?? 0) + 1)
        })
        const fraudByType = Array.from(typeMap.entries()).map(([label, count]) => ({ label, count }))

        // ── Xu hướng theo tuần (gần nhất 8 tuần) ──
        const weekMap = new Map<string, { detected: number; falsePos: number }>()
        alerts.forEach((a) => {
          const d    = new Date(a.created_at)
          const week = `Tuần ${Math.ceil(d.getDate() / 7)}`
          const prev = weekMap.get(week) ?? { detected: 0, falsePos: 0 }
          if (a.status === 'false_positive') prev.falsePos++
          else prev.detected++
          weekMap.set(week, prev)
        })
        const weeklyTrend = Array.from(weekMap.entries())
          .slice(-8)
          .map(([week, v]) => ({ week, ...v }))

        setData({
          fraudByType,
          weeklyTrend,
          stats: {
            totalRequests:       stats.total_requests ?? 0,
            fraudDetected:       stats.fraud_detected ?? 0,
            avgProcessingTimeMs: stats.average_processing_time ?? 0,
          },
        })
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

export function Analytics() {
  const theme = useTheme()
  const { data, loading, error } = useAnalyticsData()

  // ── Chỉ số mô hình: 4 placeholder + 2 giá trị thật từ backend ──
  const displayMetrics = [
    { label: 'Precision',     value: '94.2%' },
    { label: 'Recall',        value: '91.7%' },
    { label: 'F1-Score',      value: '92.9%' },
    { label: 'AUC-ROC',       value: '0.983' },
    { label: 'Tổng yêu cầu', value: data ? data.stats.totalRequests.toLocaleString('vi-VN') : '...' },
    { label: 'Avg Latency',   value: data ? `${data.stats.avgProcessingTimeMs.toFixed(0)} ms` : '...' },
  ]

  // ── BarChart: dùng data thật hoặc fallback placeholder ──
  const barLabels = data?.fraudByType.map(x => x.label) ?? fraudByTypeSeries.labels
  const barCounts = data?.fraudByType.map(x => x.count) ?? fraudByTypeSeries.counts

  // ── LineChart: dùng data thật hoặc fallback placeholder ──
  const trendWeeks    = data?.weeklyTrend.map(x => x.week)     ?? weeklyFraudTrend.weeks
  const trendDetected = data?.weeklyTrend.map(x => x.detected)  ?? weeklyFraudTrend.detected
  const trendFalsePos = data?.weeklyTrend.map(x => x.falsePos)  ?? weeklyFraudTrend.falsePos

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'text.primary', mb: 0.5 }}>Phân tích</Typography>
        <Typography variant="body2" color="text.secondary">
          Hiệu suất mô hình ML và thống kê phát hiện gian lận
        </Typography>
      </Box>

      {/* Trạng thái loading */}
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Thông báo lỗi — vẫn hiển thị dữ liệu mẫu */}
      {error && (
        <Typography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
          Lỗi tải dữ liệu thật: {error}. Đang hiển thị dữ liệu mẫu.
        </Typography>
      )}

      <Grid container spacing={3}>
        {/* Chỉ số mô hình */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider', height: '100%' }}>
            <CardHeader
              title={<Typography variant="subtitle1" fontWeight={600}>Chỉ số mô hình</Typography>}
              subheader={<Typography variant="caption" color="text.secondary">XGBoost · Calibrated · v2.1</Typography>}
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                {displayMetrics.map((m) => (
                  <Box key={m.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">{m.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {m.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Phân bố gian lận theo loại giao dịch */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}>
            <CardHeader
              title={<Typography variant="subtitle1" fontWeight={600}>Gian lận theo loại giao dịch</Typography>}
              subheader={<Typography variant="caption" color="text.secondary">Tháng 3/2026</Typography>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: barLabels,
                  tickLabelStyle: { fontSize: 11, fill: theme.palette.text.secondary },
                }]}
                yAxis={[{ tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary } }]}
                series={[{
                  data:  barCounts,
                  label: 'Số vụ gian lận',
                  color: theme.palette.error.main,
                }]}
                height={260}
                sx={{
                  '& .MuiChartsAxis-line': { stroke: theme.palette.divider },
                  '& .MuiChartsAxis-tick': { stroke: theme.palette.divider },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Trend phát hiện gian lận 8 tuần */}
        <Grid size={12}>
          <Card variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}>
            <CardHeader
              title={<Typography variant="subtitle1" fontWeight={600}>Xu hướng 8 tuần gần nhất</Typography>}
              subheader={<Typography variant="caption" color="text.secondary">Gian lận phát hiện vs nhận định sai</Typography>}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <LineChart
                xAxis={[{
                  scaleType: 'point',
                  data: trendWeeks,
                  tickLabelStyle: { fontSize: 11, fill: theme.palette.text.secondary },
                }]}
                yAxis={[{ tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary } }]}
                series={[
                  {
                    data:  trendDetected,
                    label: 'Gian lận phát hiện',
                    color: theme.palette.error.main,
                    showMark: true,
                  },
                  {
                    data:  trendFalsePos,
                    label: 'Nhận định sai',
                    color: theme.palette.warning.main,
                    showMark: true,
                  },
                ]}
                height={280}
                sx={{
                  '& .MuiChartsAxis-line': { stroke: theme.palette.divider },
                  '& .MuiChartsAxis-tick': { stroke: theme.palette.divider },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
