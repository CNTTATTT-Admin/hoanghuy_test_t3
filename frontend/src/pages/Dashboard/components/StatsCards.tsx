/**
 * StatsCards.tsx — 4 thẻ chỉ số tổng quan trên dashboard.
 * Màu sắc accent lấy từ theme.palette.* — không hardcode.
 * Click từng thẻ → mở modal chi tiết. Giá trị change tính từ hôm qua vs hôm nay.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme, alpha } from '@mui/material/styles'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined'
import PercentIcon from '@mui/icons-material/Percent'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../../../services/apiClient'
import { usePolling } from '../../../hooks/usePolling'

// ─── Hook đếm số từ 0 → giá trị thực (easeOutQuart) ─────────────────────────
function useCountUp(end: number, duration = 1500, decimals = 0): string {
  const [count, setCount] = useState(0)
  const rafRef = useRef(0)

  useEffect(() => {
    if (end === 0) return

    const startTime = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(end * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [end, duration])

  return decimals > 0
    ? count.toFixed(decimals)
    : Math.round(count).toLocaleString('vi-VN')
}

interface StatCardData {
  title:        string
  numericValue: number | null
  decimals:     number
  suffix:       string
  change:       number
  icon:         ReactNode
  palette:      'primary' | 'error' | 'warning' | 'success'
}

type CardType = 'transactions' | 'fraud' | 'rate' | 'risk'

// Hàm tính % thay đổi (tránh chia 0)
function pctChange(today: number, yesterday: number): number {
  if (yesterday === 0) return today > 0 ? 100 : 0
  return parseFloat(((today - yesterday) / yesterday * 100).toFixed(1))
}

// ─── Hook lấy thống kê từ backend ────────────────────────────────────────────
interface StatsResponse {
  total_requests:           number
  fraud_detected:           number
  today_requests:           number
  today_fraud:              number
  yesterday_requests:       number
  yesterday_fraud:          number
  avg_risk_score:           number
  yesterday_avg_risk:       number
  average_processing_time:  number
}

function useDashboardStats() {
  const [stats, setStats] = useState<{
    total: number; fraud: number
    todayTotal: number; todayFraud: number
    yesterdayTotal: number; yesterdayFraud: number
    rate: number; yesterdayRate: number
    avgRisk: number; yesterdayAvgRisk: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchStats = useCallback(() => {
    apiGet<StatsResponse>('/api/v1/stats')
      .then((data) => {
        const total          = data.total_requests || 0
        const fraud          = data.fraud_detected || 0
        const todayTotal     = data.today_requests ?? total
        const todayFraud     = data.today_fraud ?? fraud
        const yesterdayTotal = data.yesterday_requests ?? 0
        const yesterdayFraud = data.yesterday_fraud ?? 0
        const avgRisk        = data.avg_risk_score ?? 0
        const yesterdayAvg   = data.yesterday_avg_risk ?? 0
        setStats({
          total, fraud, todayTotal, todayFraud,
          yesterdayTotal, yesterdayFraud,
          rate:            todayTotal > 0 ? (todayFraud / todayTotal) * 100 : 0,
          yesterdayRate:   yesterdayTotal > 0 ? (yesterdayFraud / yesterdayTotal) * 100 : 0,
          avgRisk,
          yesterdayAvgRisk: yesterdayAvg,
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])
  usePolling(fetchStats, 60_000)
  return { stats, loading, error }
}

// ─── Hàm tạo mảng statsData, thay giá trị theo dữ liệu backend ─────────────
function buildStatsData(
  stats: { total: number; fraud: number; todayTotal: number; todayFraud: number; yesterdayTotal: number; yesterdayFraud: number; rate: number; yesterdayRate: number; avgRisk: number; yesterdayAvgRisk: number } | null,
): (StatCardData & { cardType: CardType })[] {
  const todayTotal     = stats?.todayTotal ?? 0
  const todayFraud     = stats?.todayFraud ?? 0
  const yesterdayTotal = stats?.yesterdayTotal ?? 0
  const yesterdayFraud = stats?.yesterdayFraud ?? 0
  const todayRate      = stats?.rate ?? 0
  const yesterdayRate  = stats?.yesterdayRate ?? 0
  const avgRisk        = stats?.avgRisk ?? 0
  const yesterdayAvg   = stats?.yesterdayAvgRisk ?? 0

  return [
    {
      cardType: 'transactions' as CardType,
      title:        'Giao dịch hôm nay',
      numericValue: stats?.todayTotal ?? null,
      decimals:     0,
      suffix:       '',
      change:       pctChange(todayTotal, yesterdayTotal),
      icon:         <AccountBalanceWalletOutlinedIcon />,
      palette:      'primary',
    },
    {
      cardType: 'fraud' as CardType,
      title:        'Gian lận phát hiện',
      numericValue: stats?.todayFraud ?? null,
      decimals:     0,
      suffix:       '',
      change:       pctChange(todayFraud, yesterdayFraud),
      icon:         <GppBadOutlinedIcon />,
      palette:      'error',
    },
    {
      cardType: 'rate' as CardType,
      title:        'Tỷ lệ gian lận',
      numericValue: stats?.rate ?? null,
      decimals:     2,
      suffix:       '%',
      change:       parseFloat((todayRate - yesterdayRate).toFixed(2)),
      icon:         <PercentIcon />,
      palette:      'warning',
    },
    {
      cardType: 'risk' as CardType,
      title:        'Điểm rủi ro TB',
      numericValue: stats?.avgRisk ?? null,
      decimals:     1,
      suffix:       '',
      change:       pctChange(avgRisk * 100, yesterdayAvg * 100),
      icon:         <SecurityOutlinedIcon />,
      palette:      'success',
    },
  ]
}

function StatCard({ title, numericValue, decimals, suffix, change, icon, palette, loading, onClick }: StatCardData & { loading?: boolean; onClick?: () => void }) {
  const theme = useTheme()
  const animated = useCountUp(numericValue ?? 0, 1500, decimals)

  // Lấy màu từ palette theme — type-safe, không hardcode
  const paletteMainColors: Record<StatCardData['palette'], string> = {
    primary: theme.palette.primary.main,
    error:   theme.palette.error.main,
    warning: theme.palette.warning.main,
    success: theme.palette.success.main,
  } 
  const accentColor = paletteMainColors[palette] || theme.palette.primary.main
  const isPositive  = change >= 0

  const displayValue = numericValue != null ? `${animated}${suffix}` : '—'

  return (
    <Card
      variant="outlined" 
      onClick={onClick}
      sx={{
        bgcolor:     'background.paper',
        borderColor: 'divider',
        height:      '100%',
        transition:  'border-color 0.2s, box-shadow 0.2s',
        cursor:      onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` } : { borderColor: accentColor },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Tiêu đề + Icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {title} 
          </Typography>
          <Box
            sx={{
              p: 0.8,
              borderRadius: 1,
              bgcolor: alpha(accentColor, 0.12),
              color:   accentColor,
              display: 'flex',
              lineHeight: 0,
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* Giá trị chính — hiển thị spinner khi đang tải */}
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 42, mb: 1 }}>
            <CircularProgress size={24} sx={{ color: accentColor }} />
          </Box>
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            {displayValue} 
          </Typography>
        )}

        {/* Thay đổi so với hôm qua */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isPositive
            ? <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
            : <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />
          }
          <Typography
            variant="caption"
            sx={{ color: isPositive ? 'success.main' : 'error.main', fontWeight: 600 }}
          >
            {Math.abs(change)}% 
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            so với hôm qua
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

const CARD_ROUTES: Record<CardType, string> = {
  transactions: '/dashboard/transactions',
  fraud:        '/dashboard/fraud',
  rate:         '/dashboard/fraud-rate',
  risk:         '/dashboard/risk',
}

export function StatsCards() {
  const { stats, loading } = useDashboardStats()
  const statsData = buildStatsData(stats)
  const navigate  = useNavigate()

  return (
    <Grid container spacing={2}>
      {statsData.map((stat) => (
        <Grid key={stat.title} size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            {...stat}
            loading={loading}
            onClick={() => navigate(CARD_ROUTES[stat.cardType])}
          />
        </Grid>
      ))}
    </Grid>
  )
}