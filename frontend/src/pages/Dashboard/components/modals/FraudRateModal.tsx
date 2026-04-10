/**
 * FraudRateModal.tsx — Modal tỷ lệ gian lận hôm nay.
 * Click vào thẻ "Tỷ lệ gian lận" để mở.
 * 3 tabs:
 *   1. Biểu đồ tròn Fraud vs Normal
 *   2. BarChart theo giờ
 *   3. BarChart ngang theo loại giao dịch
 */
import { useState, useEffect, useCallback } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { PieChart } from '@mui/x-charts/PieChart'
import { BarChart } from '@mui/x-charts/BarChart'
import { apiGet } from '../../../../services/apiClient'
import type { InferenceRecord, InferenceHistoryResponse } from '../types'
import { tokens } from '../../../../theme/tokens'

interface Props {
  open:        boolean
  onClose:     () => void
}

const dialogPaperSx = {
  bgcolor:         '#111827',
  border:          '1px solid #273449',
  borderRadius:    '12px',
  backgroundImage: 'none',
  maxWidth:        '92vw',
  width:           '820px',
}

const TX_TYPE_COLORS: Record<string, string> = {
  TRANSFER: '#818cf8',
  CASH_OUT: '#f87171',
  CASH_IN:  '#4ade80',
  PAYMENT:  '#60a5fa',
  DEBIT:    '#fbbf24',
}

function TabPanel({ value, index, children }: { value: number; index: number; children: React.ReactNode }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null
}

export function FraudRateModal({ open, onClose }: Props) {
  const [tab, setTab]         = useState(0)
  const [rows, setRows]       = useState<InferenceRecord[]>([])
  const [allRows, setAllRows] = useState<InferenceRecord[]>([])
  const [loading, setLoading] = useState(false)

  const fetch500 = useCallback((fraudOnly: boolean, setter: (r: InferenceRecord[]) => void) => {
    const params = new URLSearchParams({
      today_only: 'true',
      limit:      '500',
      sort_by:    'created_at',
      sort_dir:   'desc',
    })
    if (fraudOnly) params.set('is_fraud', 'true')
    return apiGet<InferenceHistoryResponse>(`/api/v1/inference-history?${params}`)
      .then((data) => setter(data.transactions))
  }, [])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    // Lấy tất cả GD (tối đa 500) và GD fraud riêng
    Promise.all([
      fetch500(false, setAllRows),
      fetch500(true, setRows),
    ]).finally(() => setLoading(false))
  }, [open, fetch500])

  // ── Pie data ──────────────────────────────────────────────────────────
  const fraudCount  = rows.length
  const normalCount = Math.max(0, allRows.length - fraudCount)
  const pieData = [
    { id: 0, value: fraudCount,  label: `Gian lận (${fraudCount})`,  color: tokens.risk.high },
    { id: 1, value: normalCount, label: `Bình thường (${normalCount})`, color: '#22C55E' },
  ].filter((d) => d.value > 0)

  // ── Bar by hour ────────────────────────────────────────────────────────
  const hourBuckets: Record<number, { fraud: number; normal: number }> = {}
  for (let h = 0; h < 24; h++) hourBuckets[h] = { fraud: 0, normal: 0 }

  allRows.forEach((r) => {
    const h = new Date(r.created_at).getHours()
    if (r.is_fraud) hourBuckets[h].fraud  += 1
    else            hourBuckets[h].normal += 1
  })

  const hourLabels  = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`)
  const hourFraud   = hourLabels.map((_, i) => hourBuckets[i].fraud)
  const hourNormal  = hourLabels.map((_, i) => hourBuckets[i].normal)

  // ── Bar by type ────────────────────────────────────────────────────────
  const typeMap: Record<string, { fraud: number; normal: number }> = {}
  allRows.forEach((r) => {
    if (!typeMap[r.transaction_type]) typeMap[r.transaction_type] = { fraud: 0, normal: 0 }
    if (r.is_fraud) typeMap[r.transaction_type].fraud  += 1
    else            typeMap[r.transaction_type].normal += 1
  })
  const typeKeys   = Object.keys(typeMap)
  const typeFraud  = typeKeys.map((k) => typeMap[k].fraud)
  const typeNormal = typeKeys.map((k) => typeMap[k].normal)

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: dialogPaperSx }} maxWidth={false}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
        <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: '16px' }}>
          Phân tích tỷ lệ gian lận hôm nay
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: '1px solid #273449', px: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          TabIndicatorProps={{ style: { backgroundColor: tokens.risk.high } }}
          sx={{ '& .MuiTab-root': { color: '#64748B', fontSize: '13px' }, '& .Mui-selected': { color: '#F1F5F9' } }}
        >
          <Tab label="Tổng quan" />
          <Tab label="Theo giờ" />
          <Tab label="Theo loại GD" />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: 320 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
            <CircularProgress sx={{ color: tokens.risk.high }} />
          </Box>
        ) : (
          <>
            {/* Tab 0: Pie */}
            <TabPanel value={tab} index={0}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 4, mb: 1 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ color: tokens.risk.high, fontSize: '32px', fontWeight: 700 }}>{fraudCount}</Typography>
                    <Typography sx={{ color: '#94A3B8', fontSize: '12px' }}>Gian lận</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ color: '#22C55E', fontSize: '32px', fontWeight: 700 }}>{normalCount}</Typography>
                    <Typography sx={{ color: '#94A3B8', fontSize: '12px' }}>Bình thường</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ color: '#F1F5F9', fontSize: '32px', fontWeight: 700 }}>
                      {allRows.length > 0 ? ((fraudCount / allRows.length) * 100).toFixed(1) : 0}%
                    </Typography>
                    <Typography sx={{ color: '#94A3B8', fontSize: '12px' }}>Tỷ lệ fraud</Typography>
                  </Box>
                </Box>

                {pieData.length > 0 ? (
                  <PieChart
                    series={[{
                      data:         pieData,
                      innerRadius:  60,
                      outerRadius:  110,
                      paddingAngle: 3,
                      cornerRadius: 4,
                      highlightScope: { fade: 'global', highlight: 'item' },
                    }]}
                    height={250}
                    slotProps={{ legend: { hidden: false } }}
                    sx={{ '& .MuiChartsTooltip-root': { bgcolor: '#1a2234' } }}
                  />
                ) : (
                  <Typography sx={{ color: '#64748B' }}>Chưa có dữ liệu hôm nay</Typography>
                )}
              </Box>
            </TabPanel>

            {/* Tab 1: Bar by hour */}
            <TabPanel value={tab} index={1}>
              <Typography sx={{ color: '#94A3B8', fontSize: '12px', mb: 1, textAlign: 'center' }}>
                Phân bố giao dịch theo giờ trong ngày (hôm nay)
              </Typography>
              <BarChart
                xAxis={[{ data: hourLabels, scaleType: 'band' }]}
                series={[
                  { data: hourNormal, label: 'Bình thường', color: '#22C55E', stack: 'total' },
                  { data: hourFraud,  label: 'Gian lận',    color: tokens.risk.high, stack: 'total' },
                ]}
                height={280}
                sx={{
                  '& .MuiChartsAxis-tickLabel': { fill: '#64748B', fontSize: '10px' },
                  '& .MuiChartsAxis-line':      { stroke: '#273449' },
                  '& .MuiChartsAxis-tick':      { stroke: '#273449' },
                }}
              />
            </TabPanel>

            {/* Tab 2: Bar by type (horizontal) */}
            <TabPanel value={tab} index={2}>
              <Typography sx={{ color: '#94A3B8', fontSize: '12px', mb: 1, textAlign: 'center' }}>
                Phân bố gian lận theo loại giao dịch
              </Typography>
              {typeKeys.length > 0 ? (
                <BarChart
                  layout="horizontal"
                  yAxis={[{ data: typeKeys, scaleType: 'band' }]}
                  series={[
                    { data: typeNormal, label: 'Bình thường', color: '#22C55E', stack: 'total' },
                    { data: typeFraud,  label: 'Gian lận',    color: tokens.risk.high, stack: 'total' },
                  ]}
                  height={Math.max(220, typeKeys.length * 48)}
                  sx={{
                    '& .MuiChartsAxis-tickLabel': { fill: '#64748B', fontSize: '11px' },
                    '& .MuiChartsAxis-line':      { stroke: '#273449' },
                    '& .MuiChartsAxis-tick':      { stroke: '#273449' },
                  }}
                />
              ) : (
                <Typography sx={{ color: '#64748B', textAlign: 'center', mt: 4 }}>
                  Chưa có dữ liệu hôm nay
                </Typography>
              )}
            </TabPanel>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #273449' }}>
        <Button size="small" onClick={onClose} sx={{ color: '#94A3B8' }}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}
