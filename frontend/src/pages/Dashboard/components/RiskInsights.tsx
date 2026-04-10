/**
 * RiskInsights.tsx — Phân bổ mức rủi ro và loại giao dịch gian lận.
 * Màu mức rủi ro lấy từ theme.tokens.risk.* — không hardcode.
 * Dữ liệu realtime từ /api/v1/stats → risk_distribution.
 */
import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import { useTheme, alpha } from '@mui/material/styles'
import { PieChart } from '@mui/x-charts/PieChart'
import { tokens } from '../../../theme'
import { apiGet } from '../../../services/apiClient'

interface RiskBreakdown {
  level:   'low' | 'medium' | 'high' | 'critical'
  label:   string
  count:   number
  percent: number
}

interface StatsResponse {
  today_requests:    number
  risk_distribution: Record<string, number>
}

const RISK_ORDER: Array<{ level: RiskBreakdown['level']; label: string }> = [
  { level: 'low',      label: 'Thấp'       },
  { level: 'medium',   label: 'Trung bình'  },
  { level: 'high',     label: 'Cao'         },
  { level: 'critical', label: 'Nguy hiểm'   },
]

export function RiskInsights() {
  const theme = useTheme()

  const [riskBreakdown, setRiskBreakdown] = useState<RiskBreakdown[]>([])
  const [totalCount, setTotalCount]       = useState(0)
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    apiGet<StatsResponse>('/api/v1/stats')
      .then((data) => {
        const dist  = data.risk_distribution ?? {}
        const total = data.today_requests || 0
        const safeTotal = total || 1
        const breakdown = RISK_ORDER.map(({ level, label }) => {
          const count = dist[level.toUpperCase()] ?? 0
          return { level, label, count, percent: Math.round((count / safeTotal) * 100) }
        })
        setRiskBreakdown(breakdown)
        setTotalCount(total)
      })
      .catch(() => setRiskBreakdown([]))
      .finally(() => setLoading(false))
  }, [])

  const pieData = riskBreakdown.map((r, i) => ({
    id:    i,
    value: r.count,
    label: r.label,
    color: tokens.risk[r.level],
  }))

  return (
    <Card variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider', height: '100%' }}>
      <CardHeader
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            Phân bổ mức rủi ro
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            Hôm nay · {totalCount.toLocaleString('vi-VN')} giao dịch được phân loại
          </Typography>
        }
        sx={{ pb: 0 }}
      />
      <CardContent>
        {/* Skeleton khi đang tải */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <Skeleton variant="circular" width={190} height={190} sx={{ bgcolor: '#1e2a3a', mx: 'auto' }} />
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rectangular" height={24} sx={{ bgcolor: '#1e2a3a', borderRadius: 1 }} />)}
          </Box>
        )}

        {/* Biểu đồ tròn */}
        {!loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -1 }}>
          <PieChart
            series={[{
              data:        pieData,
              innerRadius: 55,
              outerRadius: 95,
              paddingAngle: 2,
              cornerRadius:  3,
              highlightScope: { fade: 'global', highlight: 'item' },
            }]}
            height={210}
            slotProps={{ legend: { hidden: true } }}
            sx={{
              '& .MuiChartsTooltip-root': {
                bgcolor: 'background.elevated',
              },
            }}
          />
        </Box>
        )}

        {/* Legend + progress bars */}
        {!loading && (
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
          {riskBreakdown.map((r) => {
            const color = tokens.risk[r.level]
            return (
              <Box key={r.level}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box
                      sx={{
                        width: 10, height: 10,
                        borderRadius: '50%',
                        bgcolor: color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {r.label}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color, fontWeight: 700 }}>
                    {r.percent}% · {r.count.toLocaleString('vi-VN')}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={r.percent}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: alpha(color, 0.12),
                    '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 },
                  }}
                />
              </Box>
            )
          })}
        </Box>
        )}
      </CardContent>
    </Card>
  )
}
