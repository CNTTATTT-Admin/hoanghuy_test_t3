/**
 * DetectionTrends.tsx — Xu hướng phát hiện gian lận 30 ngày gần nhất (dữ liệu thực từ backend).
 * Màu series lấy từ theme.palette.* — không hardcode.
 */
import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import { LineChart } from '@mui/x-charts/LineChart'
import { apiGet } from '../../../services/apiClient'

// ─── Kiểu dữ liệu từ endpoint /stats/daily-trend ────────────────────────────
interface DailyTrendResponse {
  labels: string[]
  fraud:  number[]
  normal: number[]
}

export function DetectionTrends() {
  const theme = useTheme()

  // State cho dữ liệu biểu đồ — mặc định rỗng, chờ API
  const [xLabels, setXLabels]       = useState<string[]>([])
  const [fraudData, setFraudData]   = useState<number[]>([])
  const [normalData, setNormalData] = useState<number[]>([])
  const [loading, setLoading]       = useState(true)

  // Fetch xu hướng 30 ngày từ backend
  useEffect(() => {
    apiGet<DailyTrendResponse>('/api/v1/stats/daily-trend?days=30')
      .then((data) => {
        setXLabels(data.labels)
        setFraudData(data.fraud)
        setNormalData(data.normal)
      })
      .catch(() => {
        // lỗi fetch — giữ mảng rỗng, được xử lý bởi empty-state bên dưới
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider', height: '100%' }}>
      <CardHeader
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            Xu hướng phát hiện gian lận
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            Số giao dịch gian lận vs bình thường — 30 ngày qua
          </Typography>
        }
        sx={{ pb: 0 }}
      />
      <CardContent>
        {loading && (
          <Box sx={{ mt: 1 }}>
            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1, bgcolor: 'rgba(255,255,255,0.06)' }} />
          </Box>
        )}
        {!loading && xLabels.length === 0 && (
          <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary">Chưa có dữ liệu xu hướng trong 30 ngày qua</Typography>
          </Box>
        )}
        {!loading && xLabels.length > 0 && (
        <Box sx={{ mt: -1 }}>
          <LineChart
            xAxis={[{
              scaleType: 'point',
              data: xLabels,
              tickLabelStyle: {
                fontSize: 10,
                fill: theme.palette.text.secondary,
              },
              // Chỉ hiển thị mỗi 5 nhãn để tránh chồng chéo
              tickInterval: (_v: unknown, i: number) => i % 5 === 0,
            }]}
            yAxis={[{
              tickLabelStyle: {
                fontSize: 10,
                fill: theme.palette.text.secondary,
              },
            }]}
            series={[
              {
                data:  fraudData,
                label: 'Gian lận',
                color: theme.palette.error.main,
                area:  true,
                showMark: false,
              },
              {
                data:  normalData,
                label: 'Rủi ro thấp',
                color: theme.palette.primary.main,
                showMark: false,
              },
            ]}
            height={280}
            sx={{
              '& .MuiChartsLegend-root': {
                '& text': { fill: theme.palette.text.secondary },
              },
              '& .MuiChartsAxis-line':   { stroke: theme.palette.divider },
              '& .MuiChartsAxis-tick':   { stroke: theme.palette.divider },
            }}
          />
        </Box>
        )}
      </CardContent>
    </Card>
  )
}