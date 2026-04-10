/**
 * Notifications/index.tsx — Trang thông báo giao dịch đầy đủ.
 * Hiển thị tất cả alerts (single check + batch CSV), cho phép xem chi tiết
 * và điều hướng về form kiểm tra lại từng giao dịch.
 */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '../../services/apiClient'
import { usePolling } from '../../hooks/usePolling'
import { TxTypeBadge } from '../../components/TxTypeBadge'
import type { NotificationItem } from './types'
import type { TransactionForm } from '../CheckTransaction/types'

// ─────────────────────────────────────────────────────────
// Backend alert shape (sau khi backend flatten details)
// ─────────────────────────────────────────────────────────
interface BackendAlert {
  id?:             string | number
  alert_id?:       string
  type:            string
  status:          string
  risk_score?:     number | null
  amount?:         number | null
  user_id?:        string | null
  transaction_id?: string | null
  created_at:      string
  details?:        Record<string, unknown>
  assigned_to?:    string | null
}

// ─────────────────────────────────────────────────────────
// Map backend alert → NotificationItem
// ─────────────────────────────────────────────────────────
function mapAlert(a: BackendAlert): NotificationItem {
  const details = a.details ?? {}

  const rawScore = Number(
    a.risk_score ??
    details.risk_score ??
    0
  )
  const score = rawScore > 1 ? rawScore / 100 : rawScore

  let riskLevel = 'low'
  if (score >= 0.85)      riskLevel = 'critical'
  else if (score >= 0.65) riskLevel = 'high'
  else if (score >= 0.40) riskLevel = 'medium'

  const statusMap: Record<string, string> = {
    open:           'open',
    active:         'open',
    investigating:  'investigating',
    resolved:       'resolved',
    acknowledged:   'resolved',
    false_positive: 'false_positive',
    closed:         'resolved',
    blocked:        'blocked',
  }

  const decisionMap: Record<string, string> = {
    BLOCKED: 'BLOCKED', blocked: 'BLOCKED',
    PENDING: 'PENDING', pending: 'PENDING',
    APPROVED: 'APPROVED', approved: 'APPROVED',
  }

  const txId = (
    a.transaction_id ??
    (details.transaction_id as string) ??
    (details.tx_id as string) ??
    '—'
  )

  const sourceEndpoint = (details.source_endpoint as string) ?? ''
  const source: 'single' | 'batch' = sourceEndpoint.includes('batch') ? 'batch' : 'single'

  const rawDecision = (details.decision as string) ?? (a.status === 'blocked' ? 'BLOCKED' : 'APPROVED')

  const reasons: string[] = Array.isArray(details.reasons)
    ? (details.reasons as string[])
    : []

  return {
    id:            String(a.id ?? a.alert_id ?? ''),
    transactionId: txId,
    txType:        (details.tx_type as string) ?? (details.type as string) ?? '—',
    amount:        Number(a.amount ?? details.amount ?? 0),
    riskScore:     score,
    riskLevel,
    decision:      decisionMap[rawDecision] ?? 'APPROVED',
    status:        statusMap[a.status] ?? 'open',
    source,
    blockReason:   (details.block_reason as string) ?? null,
    reviewReason:  (details.review_reason as string) ?? null,
    nameOrig:      (details.nameOrig as string) ?? (details.name_orig as string) ?? (a.user_id ?? '—'),
    nameDest:      (details.nameDest as string) ?? (details.name_dest as string) ?? '—',
    reasons,
    createdAt:     new Date(a.created_at).toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }),
    rawCreatedAt:  a.created_at,
    details,
  }
}

// ─────────────────────────────────────────────────────────
// Helper: chip màu theo risk level
// ─────────────────────────────────────────────────────────
function RiskChip({ level, score }: { level: string; score: number }) {
  const cfg: Record<string, { label: string; bg: string; color: string }> = {
    critical: { label: 'Nguy hiểm', bg: '#3f1a1a', color: '#f87171' },
    high:     { label: 'Cao',       bg: '#3f2a10', color: '#fb923c' },
    medium:   { label: 'Trung bình',bg: '#2a2a10', color: '#facc15' },
    low:      { label: 'Thấp',      bg: '#1a2a1a', color: '#4ade80' },
  }
  const c = cfg[level] ?? cfg.low
  return (
    <Chip
      label={`${c.label} ${(score * 100).toFixed(0)}%`}
      size="small"
      sx={{ bgcolor: c.bg, color: c.color, fontSize: '10px', fontWeight: 700, height: 20 }}
    />
  )
}

function DecisionChip({ decision }: { decision: string }) {
  const cfg: Record<string, { label: string; bg: string; color: string }> = {
    BLOCKED:  { label: 'Đã chặn',   bg: '#3f1a1a', color: '#f87171' },
    PENDING:  { label: 'Chờ duyệt', bg: '#3f2a10', color: '#fb923c' },
    APPROVED: { label: 'Cho phép',  bg: '#1a2a1a', color: '#4ade80' },
  }
  const c = cfg[decision] ?? cfg.APPROVED
  return (
    <Chip label={c.label} size="small" sx={{ bgcolor: c.bg, color: c.color, fontSize: '10px', fontWeight: 700, height: 20 }} />
  )
}

function SourceChip({ source }: { source: 'single' | 'batch' }) {
  return source === 'batch' ? (
    <Chip label="Batch CSV" size="small" sx={{ bgcolor: '#1e1b4b', color: '#a5b4fc', fontSize: '10px', height: 18 }} />
  ) : (
    <Chip label="Đơn lẻ" size="small" sx={{ bgcolor: '#0c4a6e', color: '#7dd3fc', fontSize: '10px', height: 18 }} />
  )
}

// ─────────────────────────────────────────────────────────
// Summary stat card
// ─────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Box sx={{ bgcolor: '#0d1117', border: '1px solid #1e2330', borderRadius: '8px', p: 1.5, textAlign: 'center' }}>
      <Typography sx={{ fontSize: '22px', fontWeight: 700, color, fontFamily: 'monospace' }}>{value}</Typography>
      <Typography sx={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.5px' }}>{label}</Typography>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────
// Detail Modal
// ─────────────────────────────────────────────────────────
function NotificationDetailModal({
  item,
  onClose,
  onAcknowledge,
}: {
  item: NotificationItem | null
  onClose: () => void
  onAcknowledge: (id: string, action: 'ignore' | 'resolve') => Promise<void>
}) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  if (!item) return null

  const navigateToCheck = () => {
    const prefill: Partial<TransactionForm> = {
      userId:  item.nameOrig !== '—' ? item.nameOrig : '',
      type:    (item.txType as TransactionForm['type']) || 'PAYMENT',
      amount:  item.amount > 0 ? String(item.amount) : '',
    }
    onClose()
    navigate('/check', { state: { prefill } })
  }

  const handleAck = async (action: 'ignore' | 'resolve') => {
    setBusy(true)
    await onAcknowledge(item.id, action)
    setBusy(false)
    onClose()
  }

  const infoRow = (label: string, value: React.ReactNode) => (
    <Box sx={{ display: 'flex', gap: 2, py: 0.75, borderBottom: '1px solid #1e2330', '&:last-child': { borderBottom: 'none' } }}>
      <Typography sx={{ fontSize: '12px', color: '#6b7280', minWidth: 140 }}>{label}</Typography>
      <Typography sx={{ fontSize: '12px', color: '#d1d5db' }} component="div">{value}</Typography>
    </Box>
  )

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#0d1117', border: '1px solid #1e2330', borderRadius: '10px' } }}
    >
      <DialogTitle sx={{ color: '#fff', fontSize: '15px', fontWeight: 700, pb: 1, borderBottom: '1px solid #1e2330' }}>
        Chi tiết giao dịch
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box>
          {infoRow('Mã giao dịch', <span style={{ fontFamily: 'monospace', color: '#818cf8' }}>{item.transactionId}</span>)}
          {infoRow('Loại giao dịch', <TxTypeBadge type={item.txType} showFull />)}
          {infoRow('Số tiền', `$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)}
          {infoRow('Tài khoản nguồn', item.nameOrig)}
          {infoRow('Tài khoản đích', item.nameDest)}
          {infoRow('Mức rủi ro', <RiskChip level={item.riskLevel} score={item.riskScore} />)}
          {infoRow('Quyết định', <DecisionChip decision={item.decision} />)}
          {infoRow('Nguồn', <SourceChip source={item.source} />)}
          {infoRow('Thời gian', item.createdAt)}
          {item.blockReason && infoRow('Lý do chặn', <span style={{ color: '#f87171' }}>{item.blockReason}</span>)}
          {item.reviewReason && infoRow('Lý do xét duyệt', item.reviewReason)}
          {item.reasons.length > 0 && infoRow(
            'Phân tích ML',
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {item.reasons.map((r, i) => (
                <Typography key={i} component="li" sx={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.7 }}>
                  {r}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1, borderTop: '1px solid #1e2330', pt: 1.5, flexWrap: 'wrap' }}>
        <Button
          size="small"
          startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
          onClick={navigateToCheck}
          sx={{ color: '#818cf8', textTransform: 'none', fontSize: '12px', mr: 'auto' }}
        >
          Kiểm tra lại giao dịch này
        </Button>
        {item.status !== 'resolved' && item.status !== 'false_positive' && (
          <>
            <Button
              size="small"
              disabled={busy}
              onClick={() => handleAck('ignore')}
              sx={{ color: '#6b7280', textTransform: 'none', fontSize: '12px' }}
            >
              Bỏ qua
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={busy}
              onClick={() => handleAck('resolve')}
              sx={{ borderColor: '#22c55e', color: '#22c55e', textTransform: 'none', fontSize: '12px' }}
            >
              Đánh dấu đã xử lý
            </Button>
          </>
        )}
        <Button size="small" onClick={onClose} sx={{ color: '#6b7280', textTransform: 'none', fontSize: '12px' }}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────
// Main Notifications page
// ─────────────────────────────────────────────────────────
const ROWS_PER_PAGE = 10

export function Notifications() {
  const [items, setItems]           = useState<NotificationItem[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const mountedRef = useRef(true)

  // Filters
  const [search, setSearch]               = useState('')
  const [filterStatus, setFilterStatus]   = useState('all')
  const [filterRisk, setFilterRisk]       = useState('all')
  const [filterTxType, setFilterTxType]   = useState('all')
  const [filterSource, setFilterSource]   = useState('all')

  // Pagination
  const [page, setPage] = useState(0)

  // Detail modal
  const [selected, setSelected] = useState<NotificationItem | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!mountedRef.current) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<{ alerts: BackendAlert[]; total: number }>(
        '/api/v1/alerts?limit=200&offset=0'
      )
      if (!mountedRef.current) return
      setItems((data.alerts ?? []).map(mapAlert))
      setTotal(data.total ?? 0)
      setLastUpdated(new Date())
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    void fetchNotifications()
    return () => { mountedRef.current = false }
  }, [fetchNotifications])

  // Auto-refresh every 30s
  usePolling(fetchNotifications, 30_000)

  const handleAcknowledge = useCallback(async (id: string, action: 'ignore' | 'resolve') => {
    try {
      await apiPost(`/api/v1/alerts/${id}/acknowledge`, { action })
      await fetchNotifications()
    } catch {
      // silently fail — data will refresh on next poll
    }
  }, [fetchNotifications])

  // ── Filtering ──────────────────────────────────────────
  const filtered = useMemo(() => {
    return items.filter(item => {
      if (filterStatus !== 'all' && item.status !== filterStatus)   return false
      if (filterRisk   !== 'all' && item.riskLevel !== filterRisk)  return false
      if (filterTxType !== 'all' && item.txType !== filterTxType)   return false
      if (filterSource !== 'all' && item.source !== filterSource)   return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !item.transactionId.toLowerCase().includes(q) &&
          !item.nameOrig.toLowerCase().includes(q) &&
          !item.nameDest.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [items, filterStatus, filterRisk, filterTxType, filterSource, search])

  // Reset page khi filter thay đổi
  useEffect(() => { setPage(0) }, [filterStatus, filterRisk, filterTxType, filterSource, search])

  const paginated = filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE)

  // ── Summary counts ──────────────────────────────────────
  const blockedCount  = items.filter(i => i.decision === 'BLOCKED').length
  const pendingCount  = items.filter(i => i.decision === 'PENDING').length
  const highRiskCount = items.filter(i => i.riskLevel === 'high' || i.riskLevel === 'critical').length

  const filterSx = {
    minWidth: 130,
    '& .MuiOutlinedInput-root': {
      bgcolor: '#0d1117',
      '& fieldset': { borderColor: '#1e2330' },
      '&:hover fieldset': { borderColor: '#2a3040' },
      '&.Mui-focused fieldset': { borderColor: '#6366f1' },
    },
    '& .MuiInputLabel-root': { color: '#6b7280', fontSize: '12px' },
    '& .MuiInputBase-input': { color: '#d1d5db', fontSize: '12px' },
    '& .MuiSelect-icon': { color: '#6b7280' },
  }

  const colHead = (label: string) => (
    <TableCell sx={{ bgcolor: '#0d1117 !important', color: '#6b7280', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', borderColor: '#1e2330', py: 1 }}>
      {label}
    </TableCell>
  )

  return (
    <Box>
      {/* ── Page header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationsOutlinedIcon sx={{ color: '#818cf8', fontSize: 22 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              Thông báo giao dịch
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.25 }}>
              Tất cả cảnh báo từ kiểm tra đơn lẻ và batch CSV
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {lastUpdated && (
            <Typography sx={{ fontSize: '11px', color: '#4b5563' }}>
              Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
            </Typography>
          )}
          <IconButton size="small" onClick={() => void fetchNotifications()} sx={{ color: '#6b7280' }}>
            <RefreshIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── Summary cards ── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Tổng thông báo" value={total}         color="#818cf8" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Đã chặn"        value={blockedCount}  color="#f87171" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Chờ duyệt"      value={pendingCount}  color="#fb923c" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Rủi ro cao"     value={highRiskCount} color="#facc15" />
        </Grid>
      </Grid>

      {/* ── Filters ── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Tìm mã GD, tài khoản..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ ...filterSx, minWidth: 200 }}
          slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: '#4b5563', mr: 0.5, fontSize: 16 }} /> } }}
        />
        <TextField select label="Trạng thái" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} size="small" sx={filterSx}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="open">Mở</MenuItem>
          <MenuItem value="blocked">Đã chặn</MenuItem>
          <MenuItem value="investigating">Đang xử lý</MenuItem>
          <MenuItem value="resolved">Đã giải quyết</MenuItem>
          <MenuItem value="false_positive">Nhận định sai</MenuItem>
        </TextField>
        <TextField select label="Rủi ro" value={filterRisk} onChange={e => setFilterRisk(e.target.value)} size="small" sx={filterSx}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="critical">Nguy hiểm</MenuItem>
          <MenuItem value="high">Cao</MenuItem>
          <MenuItem value="medium">Trung bình</MenuItem>
          <MenuItem value="low">Thấp</MenuItem>
        </TextField>
        <TextField select label="Loại GD" value={filterTxType} onChange={e => setFilterTxType(e.target.value)} size="small" sx={filterSx}>
          <MenuItem value="all">Tất cả</MenuItem>
          {['CASH_IN', 'CASH_OUT', 'DEBIT', 'PAYMENT', 'TRANSFER'].map(t => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Nguồn" value={filterSource} onChange={e => setFilterSource(e.target.value)} size="small" sx={filterSx}>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="single">Đơn lẻ</MenuItem>
          <MenuItem value="batch">Batch CSV</MenuItem>
        </TextField>
      </Box>

      {/* ── Table ── */}
      <Box sx={{ bgcolor: '#0d1117', border: '1px solid #1e2330', borderRadius: '8px', overflow: 'hidden' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} sx={{ color: '#6366f1' }} />
          </Box>
        )}
        {error && (
          <Typography sx={{ color: '#f87171', fontSize: '13px', p: 3 }}>⚠ {error}</Typography>
        )}
        {!loading && !error && (
          <>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {colHead('#')}
                    {colHead('Mã GD')}
                    {colHead('Loại')}
                    {colHead('Số tiền')}
                    {colHead('Rủi ro')}
                    {colHead('Quyết định')}
                    {colHead('Nguồn')}
                    {colHead('Thời gian')}
                    {colHead('Hành động')}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ color: '#6b7280', textAlign: 'center', py: 4, borderColor: '#1e2330' }}>
                        Không có thông báo nào
                      </TableCell>
                    </TableRow>
                  ) : paginated.map((item, i) => (
                    <TableRow
                      key={item.id}
                      sx={{
                        '& td': { borderColor: '#1e2330' },
                        '&:hover': { bgcolor: '#0f1219' },
                        bgcolor: item.decision === 'BLOCKED' ? '#1a0a0a' : 'transparent',
                      }}
                    >
                      <TableCell sx={{ color: '#6b7280', fontSize: '12px' }}>{page * ROWS_PER_PAGE + i + 1}</TableCell>
                      <TableCell sx={{ color: '#818cf8', fontSize: '11px', fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.transactionId}
                      </TableCell>
                      <TableCell><TxTypeBadge type={item.txType} /></TableCell>
                      <TableCell sx={{ color: '#d1d5db', fontSize: '12px', fontFamily: 'monospace' }}>
                        ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell><RiskChip level={item.riskLevel} score={item.riskScore} /></TableCell>
                      <TableCell><DecisionChip decision={item.decision} /></TableCell>
                      <TableCell><SourceChip source={item.source} /></TableCell>
                      <TableCell sx={{ color: '#6b7280', fontSize: '11px', whiteSpace: 'nowrap' }}>{item.createdAt}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => setSelected(item)}
                          sx={{ color: '#818cf8', textTransform: 'none', fontSize: '11px', minWidth: 'unset', px: 1 }}
                        >
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Divider sx={{ borderColor: '#1e2330' }} />
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={ROWS_PER_PAGE}
              rowsPerPageOptions={[ROWS_PER_PAGE]}
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
              sx={{
                color: '#6b7280',
                fontSize: '12px',
                '& .MuiTablePagination-actions button': { color: '#6b7280' },
              }}
            />
          </>
        )}
      </Box>

      {/* ── Detail Modal ── */}
      <NotificationDetailModal
        item={selected}
        onClose={() => setSelected(null)}
        onAcknowledge={handleAcknowledge}
      />
    </Box>
  )
}
