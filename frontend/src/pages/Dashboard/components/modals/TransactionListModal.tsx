/**
 * TransactionListModal.tsx — Modal danh sách giao dịch hôm nay
 * Click vào thẻ "Giao dịch hôm nay" trên dashboard để mở.
 * Hỗ trợ: lọc theo loại GD, sắp xếp, phân trang (Load More), click hàng → chi tiết.
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
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { apiGet } from '../../../../services/apiClient'
import type { InferenceRecord, InferenceHistoryResponse } from '../types'
import { tokens } from '../../../../theme/tokens'
import { TransactionDetailPanel } from '../../../../components/TransactionDetailPanel'
import type { TransactionDetail } from '../../../CheckTransaction/types'

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

const RISK_COLOR: Record<string, string> = {
  CRITICAL: tokens.risk.critical,
  HIGH:     tokens.risk.high,
  MEDIUM:   tokens.risk.medium,
  LOW:      tokens.risk.low,
}

// ---- style constants ----
const dialogPaperSx = {
  bgcolor:         '#111827',
  border:          '1px solid #273449',
  borderRadius:    '12px',
  backgroundImage: 'none',
  maxWidth:        '92vw',
  width:           '1100px',
}
const detailDialogPaperSx = {
  bgcolor:         '#0d1117',
  border:          '1px solid #273449',
  borderRadius:    '12px',
  backgroundImage: 'none',
  maxWidth:        '480px',
  width:           '100%',
}
const theadCellSx = {
  bgcolor:        '#0B0F1A',
  borderColor:    '#273449',
  fontSize:       '11px',
  color:          '#94A3B8',
  fontWeight:     600,
  letterSpacing:  '0.8px',
  textTransform:  'uppercase' as const,
  whiteSpace:     'nowrap',
}
const tcellSx = { borderColor: '#273449', fontSize: '13px', color: '#F1F5F9' }

// ---- helper ----
function fmtAmount(n: number) {
  return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}
function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' })
}

function rowToDetail(row: InferenceRecord): TransactionDetail {
  return {
    transaction_id:    row.transaction_id ?? row.id ?? null,
    type:              row.type ?? row.transaction_type ?? null,
    amount:            row.amount,
    name_orig:         row.name_orig ?? null,
    name_dest:         row.name_dest ?? null,
    fraud_score:       row.fraud_score ?? row.risk_score ?? null,
    risk_level:        row.risk_level ?? null,
    decision:          (row.decision as TransactionDetail['decision']) ?? null,
    status:            null,
    key_factors:       row.key_factors ?? row.reasons ?? [],
    recommendations:   [],
    high_value_reason: row.high_value_reason ?? null,
    processed_at:      row.created_at ?? null,
  }
}

export function TransactionListModal({ open, onClose }: Props) {
  const [rows, setRows]           = useState<InferenceRecord[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [sortBy, setSortBy]       = useState<'amount' | 'created_at'>('created_at')
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('desc')
  const [search, setSearch]       = useState('')
  const [offset, setOffset]       = useState(0)
  const [selectedDetail, setSelectedDetail] = useState<TransactionDetail | null>(null)
  const pageSize = 50

  const fetchPage = useCallback((reset: boolean) => {
    setLoading(true)
    const params = new URLSearchParams({
      sort_by:    sortBy,
      sort_dir:   sortDir,
      limit:      String(pageSize),
      offset:     String(reset ? 0 : offset),
    })
    if (typeFilter !== 'ALL') params.set('transaction_type', typeFilter)

    apiGet<InferenceHistoryResponse>(`/api/v1/inference-history?${params}`)
      .then((data) => {
        setTotal(data.total)
        setRows((prev) => reset ? data.transactions : [...prev, ...data.transactions])
        if (!reset) setOffset((o) => o + pageSize)
      })
      .finally(() => setLoading(false))
  }, [typeFilter, sortBy, sortDir, offset])

  useEffect(() => {
    if (!open) return
    setOffset(0)
    setRows([])
    fetchPage(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, typeFilter, sortBy, sortDir])

  const toggleSort = (col: 'amount' | 'created_at') => {
    if (sortBy === col) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ col }: { col: 'amount' | 'created_at' }) =>
    sortBy === col
      ? sortDir === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 12 }} /> : <ArrowDownwardIcon sx={{ fontSize: 12 }} />
      : null

  const filtered = search.trim()
    ? rows.filter((r) => r.user_id.toLowerCase().includes(search.trim().toLowerCase()))
    : rows

  return (
    <>
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: dialogPaperSx }} maxWidth={false}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: '16px' }}>
          Tất cả giao dịch
          <Typography component="span" sx={{ ml: 1, fontSize: '12px', color: '#94A3B8' }}>
            ({total.toLocaleString()} giao dịch)
          </Typography>
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* toolbar */}
      <Box sx={{ px: 3, pb: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ color: '#94A3B8' }}>Loại GD</InputLabel>
          <Select
            value={typeFilter}
            label="Loại GD"
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ color: '#F1F5F9', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#273449' } }}
          >
            {['ALL', 'PAYMENT', 'TRANSFER', 'CASH_OUT', 'CASH_IN', 'DEBIT'].map((t) => (
              <MenuItem key={t} value={t}>{t === 'ALL' ? 'Tất cả' : t}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Tìm User ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#94A3B8' }} /></InputAdornment>,
            sx: { color: '#F1F5F9', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#273449' } },
          }}
          sx={{ minWidth: 200 }}
        />
      </Box>

      <DialogContent sx={{ p: 0, overflow: 'auto', maxHeight: '62vh' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={theadCellSx}>#</TableCell>
              <TableCell sx={theadCellSx}>User ID</TableCell>
              <TableCell sx={theadCellSx}>Loại</TableCell>
              <TableCell sx={{ ...theadCellSx, cursor: 'pointer' }} onClick={() => toggleSort('amount')}>
                Số tiền <SortIcon col="amount" />
              </TableCell>
              <TableCell sx={theadCellSx}>Số dư trước</TableCell>
              <TableCell sx={theadCellSx}>Số dư sau (ước)</TableCell>
              <TableCell sx={{ ...theadCellSx, cursor: 'pointer' }} onClick={() => toggleSort('created_at')}>
                Thời gian <SortIcon col="created_at" />
              </TableCell>
              <TableCell sx={theadCellSx}>Rủi ro</TableCell>
              <TableCell sx={theadCellSx}>Gian lận</TableCell>
              <TableCell sx={theadCellSx}>Chi tiết</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && rows.length === 0
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 10 }).map((__, j) => (
                      <TableCell key={j} sx={{ borderColor: '#273449' }}>
                        <Skeleton variant="text" sx={{ bgcolor: '#1e2a3a' }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.map((row, idx) => (
                  <TableRow
                    key={row.id ?? row.request_id ?? idx}
                    hover
                    sx={{ '&:hover': { bgcolor: '#1a2234' } }}
                  >
                    <TableCell sx={tcellSx}>{idx + 1}</TableCell>
                    <TableCell sx={{ ...tcellSx, fontFamily: 'monospace', fontSize: '11px' }}>
                      {row.user_id}
                    </TableCell>
                    <TableCell sx={tcellSx}>
                      <Chip
                        label={row.type ?? row.transaction_type}
                        size="small"
                        sx={{
                          bgcolor: TX_TYPE_COLORS[row.type ?? row.transaction_type ?? ''] + '22',
                          color:   TX_TYPE_COLORS[row.type ?? row.transaction_type ?? ''] ?? '#94A3B8',
                          border:  `1px solid ${TX_TYPE_COLORS[row.type ?? row.transaction_type ?? ''] ?? '#273449'}`,
                          fontSize: '10px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ ...tcellSx, whiteSpace: 'nowrap' }}>{fmtAmount(row.amount)}</TableCell>
                    <TableCell sx={{ ...tcellSx, whiteSpace: 'nowrap' }}>{fmtAmount(row.old_balance)}</TableCell>
                    <TableCell sx={{ ...tcellSx, whiteSpace: 'nowrap' }}>{fmtAmount(row.new_balance)}</TableCell>
                    <TableCell sx={{ ...tcellSx, whiteSpace: 'nowrap' }}>{fmtTime(row.created_at)}</TableCell>
                    <TableCell sx={tcellSx}>
                      <Chip
                        label={`${(row.risk_score * 100).toFixed(0)}%`}
                        size="small"
                        sx={{
                          bgcolor: (RISK_COLOR[row.risk_level] ?? '#94A3B8') + '22',
                          color:   RISK_COLOR[row.risk_level] ?? '#94A3B8',
                          border:  `1px solid ${RISK_COLOR[row.risk_level] ?? '#273449'}`,
                          fontSize: '10px',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={tcellSx}>
                      {row.is_fraud
                        ? <Typography component="span" sx={{ color: tokens.risk.critical, fontWeight: 700 }}>⚠ Có</Typography>
                        : <Typography component="span" sx={{ color: tokens.risk.low }}>✓ Không</Typography>
                      }
                    </TableCell>
                    <TableCell sx={tcellSx}>
                      <IconButton
                        size="small"
                        onClick={() => setSelectedDetail(rowToDetail(row))}
                        sx={{ color: '#60a5fa', '&:hover': { color: '#93c5fd' } }}
                        title="Xem chi tiết"
                      >
                        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid #273449', justifyContent: 'space-between' }}>
        <Typography sx={{ color: '#64748B', fontSize: '12px' }}>
          Hiển thị {filtered.length} / {total} giao dịch
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

    {/* ── Dialog chi tiết giao dịch ── */}
    <Dialog
      open={!!selectedDetail}
      onClose={() => setSelectedDetail(null)}
      PaperProps={{ sx: detailDialogPaperSx }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: '15px' }}>
          Chi tiết giao dịch
        </Typography>
        <IconButton onClick={() => setSelectedDetail(null)} size="small" sx={{ color: '#94A3B8' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {selectedDetail && <TransactionDetailPanel tx={selectedDetail} />}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid #273449' }}>
        <Button size="small" onClick={() => setSelectedDetail(null)} sx={{ color: '#94A3B8' }}>Đóng</Button>
      </DialogActions>
    </Dialog>
    </>
  )
}
