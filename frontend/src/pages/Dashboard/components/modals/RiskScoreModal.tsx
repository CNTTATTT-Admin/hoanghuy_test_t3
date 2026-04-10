/**
 * RiskScoreModal.tsx — Modal phân tích điểm rủi ro trung bình.
 * Click vào thẻ "Điểm rủi ro TB" để mở.
 * 4 tabs:
 *   1. Histogram phân bố điểm rủi ro (10 bins)
 *   2. Top 10 giao dịch rủi ro cao nhất
 *   3. Top 5 users xuất hiện nhiều nhất trong fraud
 *   4. Điểm rủi ro TB theo loại giao dịch
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
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import CloseIcon from '@mui/icons-material/Close'
import { BarChart } from '@mui/x-charts/BarChart'
import { apiGet } from '../../../../services/apiClient'
import type { InferenceRecord, InferenceHistoryResponse } from '../types'
import { tokens } from '../../../../theme/tokens'

interface Props {
  open:    boolean
  onClose: () => void
}

const dialogPaperSx = {
  bgcolor:         '#111827',
  border:          '1px solid #273449',
  borderRadius:    '12px',
  backgroundImage: 'none',
  maxWidth:        '92vw',
  width:           '860px',
}
const theadCellSx = {
  bgcolor:       '#0B0F1A',
  borderColor:   '#273449',
  fontSize:      '11px',
  color:         '#94A3B8',
  fontWeight:    600,
  letterSpacing: '0.8px',
  textTransform: 'uppercase' as const,
}
const tcellSx = { borderColor: '#273449', fontSize: '13px', color: '#F1F5F9' }

function scoreColor(score: number): string {
  if (score >= 0.9) return tokens.risk.critical
  if (score >= 0.7) return tokens.risk.high
  if (score >= 0.5) return tokens.risk.medium
  return tokens.risk.low
}
function fmtAmount(n: number) {
  return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}
function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
}

function TabPanel({ value, index, children }: { value: number; index: number; children: React.ReactNode }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null
}

export function RiskScoreModal({ open, onClose }: Props) {
  const [tab, setTab]       = useState(0)
  const [rows, setRows]     = useState<InferenceRecord[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({
      today_only: 'true',
      limit:      '500',
      sort_by:    'risk_score',
      sort_dir:   'desc',
    })
    apiGet<InferenceHistoryResponse>(`/api/v1/inference-history?${params}`)
      .then((data) => setRows(data.transactions))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (open) fetchData()
  }, [open, fetchData])

  // ── Histogram (10 bins 0.0–1.0) ───────────────────────────────────────
  const bins = Array.from({ length: 10 }, (_, i) => ({
    lo:    i / 10,
    hi:    (i + 1) / 10,
    label: `${(i * 10).toFixed(0)}-${((i + 1) * 10).toFixed(0)}%`,
    count: 0,
  }))
  rows.forEach((r) => {
    const idx = Math.min(Math.floor(r.risk_score * 10), 9)
    bins[idx].count += 1
  })
  const binColors = bins.map((b) => scoreColor((b.lo + b.hi) / 2))

  // ── Top 10 high-risk ──────────────────────────────────────────────────
  const top10 = rows.slice(0, 10) // already sorted desc

  // ── Top 5 users (fraud only) ──────────────────────────────────────────
  const userMap: Record<string, number> = {}
  rows.filter((r) => r.is_fraud).forEach((r) => {
    userMap[r.user_id] = (userMap[r.user_id] ?? 0) + 1
  })
  const top5Users = Object.entries(userMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // ── Avg risk by type ──────────────────────────────────────────────────
  const typeMap: Record<string, { sum: number; count: number }> = {}
  rows.forEach((r) => {
    if (!typeMap[r.transaction_type]) typeMap[r.transaction_type] = { sum: 0, count: 0 }
    typeMap[r.transaction_type].sum   += r.risk_score
    typeMap[r.transaction_type].count += 1
  })
  const typeKeys   = Object.keys(typeMap)
  const typeAvgRisk = typeKeys.map((k) => parseFloat(((typeMap[k].sum / typeMap[k].count) * 100).toFixed(1)))

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: dialogPaperSx }} maxWidth={false}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
        <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: '16px' }}>
          Phân tích điểm rủi ro hôm nay
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: '1px solid #273449', px: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          TabIndicatorProps={{ style: { backgroundColor: tokens.risk.medium } }}
          sx={{ '& .MuiTab-root': { color: '#64748B', fontSize: '13px' }, '& .Mui-selected': { color: '#F1F5F9' } }}
        >
          <Tab label="Phân bố" />
          <Tab label="Top 10 cao nhất" />
          <Tab label="Top 5 User" />
          <Tab label="Theo loại GD" />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: 320 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
            <CircularProgress sx={{ color: tokens.risk.medium }} />
          </Box>
        ) : (
          <>
            {/* Tab 0: Histogram */}
            <TabPanel value={tab} index={0}>
              <Typography sx={{ color: '#94A3B8', fontSize: '12px', mb: 1, textAlign: 'center' }}>
                Histogram phân bố điểm rủi ro — {rows.length} giao dịch hôm nay
              </Typography>
              <BarChart
                xAxis={[{ data: bins.map((b) => b.label), scaleType: 'band' }]}
                series={[{
                  data:       bins.map((b) => b.count),
                  label:      'Số giao dịch',
                  color:      tokens.risk.medium,
                  valueFormatter: (v) => `${v} GD`,
                }]}
                height={280}
                sx={{
                  '& .MuiChartsAxis-tickLabel': { fill: '#64748B', fontSize: '10px' },
                  '& .MuiChartsAxis-line':      { stroke: '#273449' },
                  '& .MuiChartsAxis-tick':      { stroke: '#273449' },
                }}
              />
              {/* colored legend */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                {[
                  { label: '0–50% (Thấp)',      color: tokens.risk.low },
                  { label: '50–70% (Trung bình)', color: tokens.risk.medium },
                  { label: '70–90% (Cao)',       color: tokens.risk.high },
                  { label: '90–100% (Rất cao)',  color: tokens.risk.critical },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            </TabPanel>

            {/* Tab 1: Top 10 */}
            <TabPanel value={tab} index={1}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={theadCellSx}>#</TableCell>
                    <TableCell sx={theadCellSx}>User ID</TableCell>
                    <TableCell sx={theadCellSx}>Loại</TableCell>
                    <TableCell sx={theadCellSx}>Số tiền</TableCell>
                    <TableCell sx={theadCellSx} align="center">Điểm rủi ro</TableCell>
                    <TableCell sx={theadCellSx}>Gian lận?</TableCell>
                    <TableCell sx={theadCellSx}>Thời gian</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {top10.map((row, idx) => {
                    const color = scoreColor(row.risk_score)
                    return (
                      <TableRow key={row.request_id} hover sx={{ '&:hover': { bgcolor: '#1a2234' } }}>
                        <TableCell sx={tcellSx}>{idx + 1}</TableCell>
                        <TableCell sx={{ ...tcellSx, fontFamily: 'monospace', fontSize: '11px' }}>
                          {row.user_id}
                        </TableCell>
                        <TableCell sx={tcellSx}>
                          <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>
                            {row.transaction_type}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ ...tcellSx, whiteSpace: 'nowrap' }}>
                          {fmtAmount(row.amount)}
                        </TableCell>
                        <TableCell sx={tcellSx}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
                            <LinearProgress
                              variant="determinate"
                              value={row.risk_score * 100}
                              sx={{
                                flex:        1,
                                height:      5,
                                borderRadius: 3,
                                bgcolor:     '#1e2a3a',
                                '& .MuiLinearProgress-bar': { bgcolor: color },
                              }}
                            />
                            <Typography sx={{ fontSize: '12px', color, fontWeight: 700, minWidth: 32 }}>
                              {(row.risk_score * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={tcellSx}>
                          {row.is_fraud
                            ? <Typography sx={{ color: tokens.risk.critical, fontWeight: 700, fontSize: '12px' }}>⚠ Có</Typography>
                            : <Typography sx={{ color: tokens.risk.low, fontSize: '12px' }}>✓ Không</Typography>
                          }
                        </TableCell>
                        <TableCell sx={{ ...tcellSx, whiteSpace: 'nowrap', fontSize: '12px' }}>
                          {fmtTime(row.created_at)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TabPanel>

            {/* Tab 2: Top 5 users */}
            <TabPanel value={tab} index={2}>
              <Typography sx={{ color: '#94A3B8', fontSize: '12px', mb: 2, textAlign: 'center' }}>
                Top 5 user có nhiều lần bị phát hiện gian lận nhất hôm nay
              </Typography>
              {top5Users.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {top5Users.map(([userId, count], i) => (
                    <Box
                      key={userId}
                      sx={{
                        display:      'flex',
                        alignItems:   'center',
                        gap:          2,
                        bgcolor:      '#0B0F1A',
                        border:       '1px solid #273449',
                        borderRadius: '8px',
                        p:            1.5,
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32, bgcolor: tokens.risk.critical + '33', color: tokens.risk.critical, fontSize: '14px', fontWeight: 700 }}>
                        {i + 1}
                      </Avatar>
                      <Typography sx={{ flex: 1, fontFamily: 'monospace', fontSize: '13px', color: '#F1F5F9' }}>
                        {userId}
                      </Typography>
                      <Chip
                        label={`${count} lần`}
                        size="small"
                        sx={{ bgcolor: tokens.risk.critical + '22', color: tokens.risk.critical, border: `1px solid ${tokens.risk.critical}`, fontWeight: 700, fontSize: '11px' }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ color: '#64748B', textAlign: 'center', mt: 4 }}>
                  Chưa có dữ liệu gian lận hôm nay
                </Typography>
              )}
            </TabPanel>

            {/* Tab 3: Avg risk by type */}
            <TabPanel value={tab} index={3}>
              <Typography sx={{ color: '#94A3B8', fontSize: '12px', mb: 1, textAlign: 'center' }}>
                Điểm rủi ro trung bình (%) theo loại giao dịch
              </Typography>
              {typeKeys.length > 0 ? (
                <BarChart
                  layout="horizontal"
                  yAxis={[{ data: typeKeys, scaleType: 'band' }]}
                  series={[{
                    data:           typeAvgRisk,
                    label:          'Risk TB (%)',
                    color:          tokens.risk.medium,
                    valueFormatter: (v) => `${v}%`,
                  }]}
                  xAxis={[{ min: 0, max: 100, valueFormatter: (v) => `${v}%` }]}
                  height={Math.max(220, typeKeys.length * 52)}
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
