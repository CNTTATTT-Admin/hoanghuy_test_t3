/**
 * Dashboard/index.tsx — Trang tổng quan hệ thống phát hiện gian lận.
 * Bố cục nội dung tự do — AppShell chỉ cung cấp vùng trống.
 */
import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { StatsCards }       from './components/StatsCards'  // 4 thẻ chỉ số chính
import { LiveAnomalyFeed }  from './components/LiveAnomalyFeed' // Luồng bất thường thời gian thực
import { DetectionTrends }  from './components/DetectionTrends' // Biểu đồ xu hướng phát hiện gian lận
import { RiskInsights }     from './components/RiskInsights'  // Phân bổ rủi ro theo loại giao dịch

/** Trả về chuỗi giờ:phút:giây hiện tại */
function formatNow() {
  return new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export function Dashboard() {
  const [clock, setClock] = useState(formatNow) // Khởi tạo đồng hồ ngay khi component được mount

  // Cập nhật đồng hồ mỗi 30 giây
  useEffect(() => {
    const id = setInterval(() => setClock(formatNow()), 30_000) // 30_000 ms = 30 giây
    return () => clearInterval(id) // Dọn dẹp interval khi component unmount
  }, [])

  return (
    <Box sx={{
        width: '100%', // Chiếm toàn bộ chiều rộng của vùng chứa
        minHeight: '100vh',// Đảm bảo chiều cao tối thiểu để footer luôn ở dưới cùng
        p: {xs: 2, md: 3}, 
        boxSizing: 'border-box',
    }}>
      {/* Tiêu đề trang */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'text.primary', mb: 0.5 }}>
          Tổng quan hệ thống
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Giám sát giao dịch theo thời gian thực · Cập nhật lúc {clock} 
        </Typography>
      </Box>

      {/* Hàng 1: 4 thẻ chỉ số */}
      <StatsCards />

      {/* Hàng 2: Biểu đồ xu hướng + Phân bổ rủi ro */}
      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <DetectionTrends />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <RiskInsights />
        </Grid>
      </Grid>

      {/* Hàng 3: Luồng bất thường thời gian thực */}
      <Box sx={{ mt: 3 }}>
        <LiveAnomalyFeed />
      </Box>
    </Box>
  )
}
