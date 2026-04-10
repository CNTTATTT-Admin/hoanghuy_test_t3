import { useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import FlashOnOutlinedIcon from '@mui/icons-material/FlashOnOutlined'
import { useAlerts } from './hooks/useAlerts'
import { AlertFilters } from './components/AlertFilters'
import { AlertTable } from './components/AlertTable'
import { AlertDetailModal } from './components/AlertDetailModal'
import { apiPost } from '../../services/apiClient'
import { tokens } from '../../theme'
import { normalizeTxType } from '../../utils/transactionType'
import type { AlertRecord } from './types'

export function Alerts() {
  // Lấy dữ liệu cảnh báo từ backend — tự động polling mỗi 30 giây
  const { alerts, loading, error, lastUpdated, refetch } = useAlerts({ limit: 100, pollingMs: 30_000 })

  const [page, setPage]                   = useState(0)
  const [search, setSearch]               = useState('')
  const [filterRisk, setFilterRisk]       = useState('all')
  const [filterStatus, setFilterStatus]   = useState('all')
  const [filterTxType, setFilterTxType]   = useState('all')
  const [detailAlert, setDetailAlert]     = useState<AlertRecord | null>(null)

  const filtered = useMemo(() =>
    alerts.filter((a) => {
      if (filterRisk   !== 'all' && a.riskLevel !== filterRisk)   return false
      if (filterStatus !== 'all' && a.status    !== filterStatus) return false
      if (filterTxType !== 'all' && normalizeTxType(a.txType) !== filterTxType) return false
      if (search) {
        const q = search.toLowerCase()
        const matchId   = a.id.toLowerCase().includes(q)
        const matchTxId = a.txId.toLowerCase().includes(q)
        const matchOrig = (a.nameOrig ?? '').toLowerCase().includes(q)
        const matchDest = (a.nameDest ?? '').toLowerCase().includes(q)
        if (!matchId && !matchTxId && !matchOrig && !matchDest) return false
      }
      return true
    }),
    [alerts, search, filterRisk, filterStatus, filterTxType],
  )

  const handleReset = () => {
    setSearch(''); setFilterRisk('all'); setFilterStatus('all'); setFilterTxType('all'); setPage(0)
  }

  // Chỉ tính điểm rủi ro trung bình từ alerts đang mở / đang xử lý
  const openAlerts = filtered.filter(a => a.status === 'open' || a.status === 'investigating')
  const avgRisk = openAlerts.length
    ? openAlerts.reduce((s, a) => s + (isNaN(a.riskScore) ? 0 : a.riskScore), 0) / openAlerts.length
    : 0
  const avgRiskDisplay = avgRisk.toFixed(1)
  const riskBarColor = avgRisk >= 8.5 ? tokens.risk.critical
    : avgRisk >= 6.5 ? tokens.risk.high
    : avgRisk >= 4.0 ? tokens.risk.medium
    : tokens.risk.low

  // Hành động — gọi API rồi reload danh sách
  const handleIgnore = async (id: string) => {
    await apiPost(`/api/v1/alerts/${id}/acknowledge`, { action: 'ignore' })
    refetch()
  }
  const handleResolve = async (id: string) => {
    await apiPost(`/api/v1/alerts/${id}/acknowledge`, { action: 'resolve' })
    refetch()
  }
  const handleEscalate = (id: string) => {
    // Placeholder — mở ticket / gửi thông báo escalate
    console.info('[Escalate] alert ID:', id)
  }

  return (
    <Box>
      {/* ── Header trang ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
            Cảnh báo đang hoạt động
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af', mt: 0.5 }}>
            Phát hiện mối đe dọa thời gian thực từ các nút AI. Xem xét các giao dịch bị gắn cờ trên toàn mạng.
          </Typography>
          {/* Thời gian cập nhật cuối + thông báo polling */}
          {lastUpdated && (
            <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
              Cập nhật lúc {lastUpdated.toLocaleTimeString('vi-VN')} · Tự động làm mới mỗi 30 giây
            </Typography>
          )}
        </Box>

        {/* Điểm rủi ro tổng — progress bar động */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            px: 2,
            py: 1.5,
            bgcolor: '#0d1117',
            border: '1px solid #1e2330',
            borderRadius: '8px',
            flexShrink: 0,
            minWidth: 180,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '10px', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
              ĐIỂM RỦI RO CHUNG
            </Typography>
            <FlashOnOutlinedIcon sx={{ fontSize: 16, color: riskBarColor }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: riskBarColor, lineHeight: 1 }}>
              {avgRiskDisplay}
            </Typography>
            <Typography component="span" sx={{ fontSize: '12px', color: '#6b7280' }}>/ 10</Typography>
          </Box>
          {/* Progress bar */}
          <Box sx={{ width: '100%', height: 4, bgcolor: '#1e2330', borderRadius: 2, mt: 0.75 }}>
            <Box sx={{
              width: `${(avgRisk / 10) * 100}%`,
              height: '100%',
              bgcolor: riskBarColor,
              borderRadius: 2,
              transition: 'width 0.5s ease',
            }} />
          </Box>
          <Typography sx={{ fontSize: '10px', color: '#6b7280', mt: 0.5 }}>
            {openAlerts.length} cảnh báo đang mở
          </Typography>
        </Box>
      </Box>

      {/* ── Thông báo lỗi khi tải dữ liệu ── */}
      {error && (
        <Typography color="error" variant="caption" sx={{ mb: 1, display: 'block' }}>
          Lỗi tải dữ liệu: {error}. Hiển thị dữ liệu cũ.
        </Typography>
      )}

      {/* ── Bộ lọc ── */}
      <AlertFilters
        search={search}
        filterRisk={filterRisk}
        filterStatus={filterStatus}
        filterTxType={filterTxType}
        onSearchChange={(v) => { setSearch(v); setPage(0) }}
        onRiskChange={(v) => { setFilterRisk(v); setPage(0) }}
        onStatusChange={(v) => { setFilterStatus(v); setPage(0) }}
        onTxTypeChange={(v) => { setFilterTxType(v); setPage(0) }}
        onReset={handleReset}
      />

      {/* ── Bảng dữ liệu ── */}
      <Box sx={{ mt: 2.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={36} sx={{ color: '#818cf8' }} />
          </Box>
        ) : (
          <AlertTable
            data={filtered}
            page={page}
            rowsPerPage={10}
            onPageChange={setPage}
            onViewDetail={setDetailAlert}
            onIgnore={handleIgnore}
            onResolve={handleResolve}
            onEscalate={handleEscalate}
          />
        )}
      </Box>

      {/* ── Modal chi tiết ── */}
      <AlertDetailModal
        open={detailAlert !== null}
        alert={detailAlert}
        onClose={() => setDetailAlert(null)}
        onIgnore={handleIgnore}
        onResolve={handleResolve}
      />
    </Box>
  )
}
