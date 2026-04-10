/**
 * FraudListModal.tsx — Modal danh sách giao dịch BỊ phát hiện gian lận hôm nay.
 * Click vào thẻ "Gian lận phát hiện" để mở.
 * Bảng sắp xếp theo risk_score giảm dần. Bấm "Xem chi tiết" để xem features JSONB + reasons.
 */
import { useState, useEffect, useCallback } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import LinearProgress from '@mui/material/LinearProgress'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { apiGet } from '../../../../services/apiClient'
import type { InferenceRecord, InferenceHistoryResponse } from '../types'
import { tokens } from '../../../../theme/tokens'

interface Props {
  open:    boolean
  onClose: () => void
}

const TX_TYPE_COLORS: Record<string, string> = {
  TRANSFER: '#818cf8',
  CASH_OUT: '#f87171',
  CASH_IN:  '#4ade80',
  PAYMENT:  '#60a5fa',
  DEBIT:    '#fbbf24',
}

const dialogPaperSx = {
  bgcolor:         '#111827',
  border:          '1px solid #273449',
  borderRadius:    '12px',
  backgroundImage: 'none',
  maxWidth:        '92vw',
  width:           '1000px',
}
const theadCellSx = {
  bgcolor:       '#0B0F1A',
  borderColor:   '#273449',
  fontSize:      '11px',
  color:         '#94A3B8',
  fontWeight:    600,
  letterSpacing: '0.8px',
  textTransform: 'uppercase' as const,
  whiteSpace:    'nowrap',
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
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' })
}

// ---- nested detail dialog ----
function FeatureDetailDialog({ row, onClose }: { row: InferenceRecord; onClose: () => void }) {
  const featureEntries = Object.entries(row.features ?? {})

  return (
    <Dialog
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          ...dialogPaperSx,
          width:     '700px',
          maxHeight: '85vh',
        },
      }}
      maxWidth={false}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: '15px' }}>
            Chi tiết giao dịch gian lận
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '12px', fontFamily: 'monospace' }}>
            {row.request_id}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* transaction info */}
        <Typography sx={{ color: '#94A3B8', fontSize: '11px', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', mb: 1 }}>
          Thông tin giao dịch
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
          {[
            ['User ID',       row.user_id],
            ['Loại GD',       row.transaction_type],
            ['Số tiền',       fmtAmount(row.amount)],
            ['Số dư trước',   fmtAmount(row.old_balance)],
            ['Số dư sau (ước)', fmtAmount(row.new_balance)],
            ['Thời gian',     fmtTime(row.created_at)],
            ['Điểm rủi ro',   `${(row.risk_score * 100).toFixed(1)}%`],
            ['Mức độ',        row.risk_level],
          ].map(([label, val]) => (
            <Box key={label} sx={{ bgcolor: '#0B0F1A', borderRadius: '6px', p: 1 }}>
              <Typography sx={{ fontSize: '10px', color: '#64748B', mb: 0.25 }}>{label}</Typography>
              <Typography sx={{ fontSize: '13px', color: '#F1F5F9', fontWeight: 500 }}>{val}</Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ borderColor: '#273449', mb: 2 }} />

        {/* features table */}
        <Typography sx={{ color: '#94A3B8', fontSize: '11px', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', mb: 1 }}>
          Features đầu vào
        </Typography>
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={theadCellSx}>Feature</TableCell>
              <TableCell sx={theadCellSx}>Giá trị</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {featureEntries.length > 0
              ? featureEntries.map(([k, v]) => (
                  <TableRow key={k}>
                    <TableCell sx={{ ...tcellSx, fontFamily: 'monospace', fontSize: '12px' }}>{k}</TableCell>
                    <TableCell sx={tcellSx}>{String(v)}</TableCell>
                  </TableRow>
                ))
              : (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ ...tcellSx, textAlign: 'center', color: '#64748B' }}>
                      Không có dữ liệu features
                    </TableCell>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>

        {/* reasons */}
        {row.reasons && row.reasons.length > 0 && (
          <>
            <Divider sx={{ borderColor: '#273449', mb: 2 }} />
            <Typography sx={{ color: '#94A3B8', fontSize: '11px', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', mb: 1 }}>
              Lý do phát hiện
            </Typography>
            <List dense disablePadding>
              {row.reasons.map((r, i) => (
                <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                  <ListItemText
                    primary={`• ${r}`}
                    primaryTypographyProps={{ fontSize: '13px', color: '#F1F5F9' }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #273449' }}>
        <Button size="small" onClick={onClose} sx={{ color: '#94A3B8' }}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}

// ---- main modal ----
export function FraudListModal({ open, onClose }: Props) {
  const [rows, setRows]         = useState<InferenceRecord[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [offset, setOffset]     = useState(0)
  const [selected, setSelected] = useState<InferenceRecord | null>(null)
  const pageSize = 50

  const fetchPage = useCallback((reset: boolean) => {
    setLoading(true)
    const params = new URLSearchParams({
      today_only: 'true',
      is_fraud:   'true',
      sort_by:    'risk_score',
      sort_dir:   'desc',
      limit:      String(pageSize),
      offset:     String(reset ? 0 : offset),
    })
    apiGet<InferenceHistoryResponse>(`/api/v1/inference-history?${params}`)
      .then((data) => {
        setTotal(data.total)
        setRows((prev) => reset ? data.transactions : [...prev, ...data.transactions])
        if (!reset) setOffset((o) => o + pageSize)
      })
      .finally(() => setLoading(false))
  }, [offset])

  useEffect(() => {
    if (!open) return
    setOffset(0)
    setRows([])
    fetchPage(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <>
      <Dialog open={open} onClose={onClose} PaperProps={{ sx: dialogPaperSx }} maxWidth={false}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: '16px' }}>
            Giao dịch gian lận hôm nay
            <Typography component="span" sx={{ ml: 1, fontSize: '12px', color: '#94A3B8' }}>
              ({total} ca phát hiện)
            </Typography>
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'auto', maxHeight: '65vh' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={theadCellSx}>#</TableCell>
                <TableCell sx={theadCellSx}>User ID</TableCell>
                <TableCell sx={theadCellSx}>Loại</TableCell>
                <TableCell sx={theadCellSx}>Số tiền</TableCell>
                <TableCell sx={theadCellSx} align="center">Điểm rủi ro</TableCell>
                <TableCell sx={theadCellSx}>Thời gian</TableCell>
                <TableCell sx={theadCellSx} align="center">Chi tiết</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && rows.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j} sx={{ borderColor: '#273449' }}>
                          <Skeleton variant="text" sx={{ bgcolor: '#1e2a3a' }} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : rows.map((row, idx) => {
                    const color = scoreColor(row.risk_score)
                    return (
                      <TableRow key={row.request_id} hover sx={{ '&:hover': { bgcolor: '#1a2234' } }}>
                        <TableCell sx={tcellSx}>{idx + 1}</TableCell>
                        <TableCell sx={{ ...tcellSx, fontFamily: 'monospace', fontSize: '11px' }}>
                          {row.user_id}
                        </TableCell>
                        <TableCell sx={tcellSx}>
                          <Chip
                            label={row.transaction_type}
                            size="small"
                            sx={{
                              bgcolor:  (TX_TYPE_COLORS[row.transaction_type] ?? '#94A3B8') + '22',
                              color:    TX_TYPE_COLORS[row.transaction_type] ?? '#94A3B8',
                              border:   `1px solid ${TX_TYPE_COLORS[row.transaction_type] ?? '#273449'}`,
                              fontSize: '10px',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ ...tcellSx, whiteSpace: 'nowrap' }}>
                          {fmtAmount(row.amount)}
                        </TableCell>
                        <TableCell sx={tcellSx}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 110 }}>
                            <LinearProgress
                              variant="determinate"
                              value={row.risk_score * 100}
                              sx={{
                                flex:            1,
                                height:          6,
                                borderRadius:    3,
                                bgcolor:         '#1e2a3a',
                                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                              }}
                            />
                            <Typography sx={{ fontSize: '12px', color, fontWeight: 700, minWidth: 34 }}>
                              {(row.risk_score * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...tcellSx, whiteSpace: 'nowrap' }}>
                          {fmtTime(row.created_at)}
                        </TableCell>
                        <TableCell sx={tcellSx} align="center">
                          <IconButton
                            size="small"
                            onClick={() => setSelected(row)}
                            sx={{ color: '#60a5fa' }}
                          >
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })
              }
            </TableBody>
          </Table>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid #273449', justifyContent: 'space-between' }}>
          <Typography sx={{ color: '#64748B', fontSize: '12px' }}>
            Hiển thị {rows.length} / {total} ca
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {rows.length < total && (
              <Button
                size="small"
                variant="outlined"
                disabled={loading}
                onClick={() => fetchPage(false)}
                sx={{ borderColor: '#273449', color: '#94A3B8' }}
              >
                Tải thêm
              </Button>
            )}
            <Button size="small" onClick={onClose} sx={{ color: '#94A3B8' }}>Đóng</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* nested detail dialog */}
      {selected && (
        <FeatureDetailDialog row={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
