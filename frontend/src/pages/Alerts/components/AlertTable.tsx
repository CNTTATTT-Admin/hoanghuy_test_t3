import { useState } from 'react'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { alpha } from '@mui/material/styles'
import { tokens } from '../../../theme'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import type { AlertRecord, SortField, SortDirection } from '../types'
import { riskLabels, statusConfig } from '../types'
import { TxTypeBadge } from '../../../components/TxTypeBadge'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoItem({ label, value }: { label: string; value?: string | number }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.25 }}>
      <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>{label}</Typography>
      <Typography sx={{ fontSize: '11px', color: '#e2e8f0', fontFamily: 'monospace' }}>
        {value ?? '—'}
      </Typography>
    </Box>
  )
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function getRowStyle(row: AlertRecord) {
  const isHighValue = row.amount >= 5_000_000
  const isCritical  = row.riskLevel === 'critical'
  const isHigh      = row.riskLevel === 'high'
  if (isCritical && isHighValue) return {
    borderLeft: '4px solid #ef4444', bgcolor: 'rgba(239,68,68,0.08)',
    boxShadow: 'inset 0 0 20px rgba(239,68,68,0.05)',
  }
  if (isCritical) return { borderLeft: '3px solid #ef4444', bgcolor: 'rgba(239,68,68,0.04)' }
  if (isHigh && isHighValue) return { borderLeft: '3px solid #f59e0b', bgcolor: 'rgba(249,115,22,0.06)' }
  if (isHigh) return { borderLeft: '3px solid #f59e0b', bgcolor: 'rgba(249,115,22,0.03)' }
  if (row.riskLevel === 'medium' && isHighValue) return { borderLeft: '2px solid #eab308', bgcolor: 'rgba(234,179,8,0.03)' }
  return {}
}

function isNewAlert(row: AlertRecord): boolean {
  return row.status === 'open' && (row.waitTimeMinutes ?? 999) <= 5
}

// ─── Sortable Header ──────────────────────────────────────────────────────────

function SortableHeader({
  label, field, currentField, direction, onSort, align = 'left',
}: {
  label: string; field: SortField
  currentField?: SortField; direction?: SortDirection
  onSort?: (field: SortField) => void
  align?: 'left' | 'center' | 'right'
}) {
  const isActive = currentField === field
  return (
    <TableCell
      align={align}
      onClick={() => onSort?.(field)}
      sx={{ cursor: onSort ? 'pointer' : 'default', userSelect: 'none', '&:hover': { color: '#e2e8f0' } }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.5,
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
      }}>
        {label}
        {isActive && (
          direction === 'asc'
            ? <ArrowUpwardIcon sx={{ fontSize: 10 }} />
            : <ArrowDownwardIcon sx={{ fontSize: 10 }} />
        )}
      </Box>
    </TableCell>
  )
}

// ─── CSS Keyframes ────────────────────────────────────────────────────────────

const tableKeyframes = {
  '@keyframes alertSlideIn': {
    '0%':   { opacity: 0, transform: 'translateY(-8px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes alertGlow': {
    '0%':   { boxShadow: 'inset 0 0 0 rgba(129,140,248,0)' },
    '50%':  { boxShadow: 'inset 0 0 12px rgba(129,140,248,0.08)' },
    '100%': { boxShadow: 'inset 0 0 0 rgba(129,140,248,0)' },
  },
  '@keyframes dotPulse': {
    '0%':   { opacity: 1 },
    '50%':  { opacity: 0.3 },
    '100%': { opacity: 1 },
  },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AlertTableProps {
  data:          AlertRecord[]
  page:          number
  rowsPerPage:   number
  onPageChange:  (page: number) => void
  onViewDetail:  (row: AlertRecord) => void
  onIgnore:      (id: string) => Promise<void>
  onResolve:     (id: string) => Promise<void>
  onEscalate:    (id: string) => void
  onMarkFraud:   (id: string) => Promise<void>
  onMarkLegit:   (id: string) => Promise<void>
  onAssign:      (id: string) => void
  onAddComment:  (id: string) => void
  sortField?:    SortField
  sortDirection?: SortDirection
  onSort?:       (field: SortField) => void
}

export function AlertTable({
  data, page, rowsPerPage, onPageChange,
  onViewDetail, onIgnore, onResolve, onEscalate,
  onMarkFraud, onMarkLegit, onAssign, onAddComment,
  sortField, sortDirection, onSort,
}: AlertTableProps) {
  const paged = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // State cho MoreVert menu
  const [menuAnchor,   setMenuAnchor]   = useState<HTMLElement | null>(null)
  const [menuRow,      setMenuRow]      = useState<AlertRecord | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const openMenu  = (e: React.MouseEvent<HTMLElement>, row: AlertRecord) => {
    e.stopPropagation()
    setMenuAnchor(e.currentTarget)
    setMenuRow(row)
  }
  const closeMenu = () => { setMenuAnchor(null); setMenuRow(null) }

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Box sx={{ bgcolor: '#0d1117', border: '1px solid #1e2330', borderRadius: '8px', overflow: 'hidden' }}>
      <TableContainer sx={tableKeyframes}>
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                '& th': {
                  bgcolor: '#080a10',
                  borderColor: '#1e2330',
                  color: '#6b7280',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  py: 1.5,
                },
              }}
            >
              <TableCell sx={{ width: 32, px: 0.5 }} />
              <TableCell>THỜI GIAN</TableCell>
              <TableCell>MÃ GIAO DỊCH</TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>TÀI KHOẢN</TableCell>
              <TableCell align="center">LOẠI GD</TableCell>
              <SortableHeader label="SỐ TIỀN"  field="amount"   currentField={sortField} direction={sortDirection} onSort={onSort} align="right" />
              <SortableHeader label="RISK"     field="risk"     currentField={sortField} direction={sortDirection} onSort={onSort} align="center" />
              <TableCell align="center">MỨC RR</TableCell>
              <SortableHeader label="PRIOR."   field="priority" currentField={sortField} direction={sortDirection} onSort={onSort} align="center" />
              <SortableHeader label="SLA"      field="sla"      currentField={sortField} direction={sortDirection} onSort={onSort} align="center" />
              <TableCell sx={{ display: { xs: 'none', xl: 'table-cell' } }}>LÝ DO FLAG</TableCell>
              <TableCell align="center">TRẠNG THÁI</TableCell>
              <TableCell align="right">HÀNH ĐỘNG</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paged.map((row) => {
              const riskColor  = tokens.risk[row.riskLevel]
              const isExpanded = expandedRows.has(row.id)
              const isNew      = isNewAlert(row)

              return (
                <>
                  <TableRow
                    key={row.id}
                    onClick={() => onViewDetail(row)}
                    sx={{
                      cursor: 'pointer',
                      '& td': { borderColor: '#1e2330', py: 1.25 },
                      ...getRowStyle(row),
                      ...(isNew && {
                        animation: 'alertSlideIn 0.4s ease-out, alertGlow 2s ease-in-out 3',
                      }),
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                      '&:last-child td': { border: 0 },
                    }}
                  >
                    {/* Expand toggle */}
                    <TableCell sx={{ width: 32, px: 0.5 }} onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" onClick={() => toggleExpand(row.id)}>
                        {isExpanded
                          ? <KeyboardArrowUpIcon sx={{ fontSize: 16, color: '#818cf8' }} />
                          : <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                        }
                      </IconButton>
                    </TableCell>

                    {/* Thời gian */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        {row.status === 'open' && (
                          <Box sx={{
                            width: 6, height: 6, borderRadius: '50%', bgcolor: '#818cf8', flexShrink: 0,
                            animation: 'dotPulse 2s infinite',
                          }} />
                        )}
                        <Box>
                          <Typography sx={{ fontSize: '12px', color: '#9ca3af' }}>{row.createdAt}</Typography>
                          {isNew && (
                            <Typography sx={{
                              fontSize: '8px', fontWeight: 800, color: '#818cf8',
                              bgcolor: 'rgba(129,140,248,0.15)', px: 0.75, py: 0.1,
                              borderRadius: '4px', letterSpacing: '0.5px', display: 'inline-block', mt: 0.25,
                            }}>
                              MỚI
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Mã giao dịch */}
                    <TableCell>
                      <Typography
                        onClick={(e) => { e.stopPropagation(); onViewDetail(row) }}
                        sx={{
                          fontSize: '12px', color: '#818cf8', fontFamily: 'monospace', fontWeight: 600,
                          cursor: 'pointer', '&:hover': { textDecoration: 'underline' },
                          maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                      >
                        {row.txId}
                      </Typography>
                    </TableCell>

                    {/* Tài khoản nguồn → đích */}
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      <Box>
                        <Typography sx={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.nameOrig ?? '—'}
                        </Typography>
                        <Typography sx={{ fontSize: '10px', color: '#6b7280' }}>→ {row.nameDest ?? '—'}</Typography>
                      </Box>
                    </TableCell>

                    {/* Loại giao dịch */}
                    <TableCell align="center">
                      <TxTypeBadge type={row.txType} />
                    </TableCell>

                    {/* Số tiền */}
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        {row.amount >= 10_000_000 && (
                          <Tooltip title="Giao dịch giá trị rất cao">
                            <WarningAmberIcon sx={{ fontSize: 12, color: '#ef4444' }} />
                          </Tooltip>
                        )}
                        <Typography sx={{
                          fontSize: '12px', fontWeight: 700, fontFamily: 'monospace',
                          color: row.amount >= 5_000_000 ? '#ef4444' : row.amount >= 1_000_000 ? '#f59e0b' : '#9ca3af',
                        }}>
                          {new Intl.NumberFormat('vi-VN').format(row.amount)}₫
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Risk Score */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: riskColor, minWidth: 24 }}>
                          {row.riskScore}
                        </Typography>
                        <Box sx={{ flex: 1, height: 3, bgcolor: '#1e2330', borderRadius: 2, maxWidth: 36 }}>
                          <Box sx={{ width: `${(row.riskScore / 10) * 100}%`, height: '100%', bgcolor: riskColor, borderRadius: 2 }} />
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Mức rủi ro */}
                    <TableCell align="center">
                      <Chip
                        label={riskLabels[row.riskLevel].toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: alpha(riskColor, 0.14),
                          color: riskColor,
                          border: `1px solid ${alpha(riskColor, 0.3)}`,
                          fontWeight: 700, fontSize: '10px', letterSpacing: '0.5px', height: 22,
                        }}
                      />
                    </TableCell>

                    {/* Priority Score */}
                    <TableCell align="center">
                      <Chip
                        label={row.priorityScore}
                        size="small"
                        sx={{
                          bgcolor: row.priorityScore >= 80 ? 'rgba(239,68,68,0.15)' : row.priorityScore >= 50 ? 'rgba(249,115,22,0.15)' : 'rgba(34,197,94,0.15)',
                          color: row.priorityScore >= 80 ? '#ef4444' : row.priorityScore >= 50 ? '#f59e0b' : '#22c55e',
                          fontWeight: 700, fontSize: '11px', height: 22, minWidth: 36,
                        }}
                      />
                    </TableCell>

                    {/* SLA / Chờ xử lý */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                        {row.slaStatus === 'overdue' && (
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef4444', animation: 'dotPulse 1.5s infinite' }} />
                        )}
                        {row.slaStatus === 'warning' && (
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                        )}
                        <Typography sx={{
                          fontSize: '11px',
                          fontWeight: row.slaStatus === 'overdue' ? 700 : 400,
                          color: row.slaStatus === 'overdue' ? '#ef4444' : row.slaStatus === 'warning' ? '#f59e0b' : '#6b7280',
                        }}>
                          {row.waitTimeMinutes < 60
                            ? `${row.waitTimeMinutes}m`
                            : `${Math.floor(row.waitTimeMinutes / 60)}h${row.waitTimeMinutes % 60}m`}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Lý do flag */}
                    <TableCell sx={{ display: { xs: 'none', xl: 'table-cell' } }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 180 }}>
                        {(row.modelExplanation ?? []).slice(0, 2).map((reason, i) => (
                          <Chip
                            key={i} label={reason} size="small"
                            sx={{ height: 18, fontSize: '9px', bgcolor: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)' }}
                          />
                        ))}
                        {(row.modelExplanation?.length ?? 0) > 2 && (
                          <Typography sx={{ fontSize: '9px', color: '#6b7280' }}>
                            +{row.modelExplanation!.length - 2}
                          </Typography>
                        )}
                        {(!row.modelExplanation || row.modelExplanation.length === 0) && (
                          <Typography sx={{ fontSize: '10px', color: '#374151' }}>—</Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                        <Box sx={{
                          width: 6, height: 6, borderRadius: '50%',
                          bgcolor: statusConfig[row.status]?.color === 'warning' ? '#f59e0b'
                            : statusConfig[row.status]?.color === 'info' ? '#3b82f6'
                            : statusConfig[row.status]?.color === 'success' ? '#22c55e'
                            : statusConfig[row.status]?.color === 'error' ? '#ef4444'
                            : '#6b7280',
                        }} />
                        <Typography sx={{ fontSize: '12px', color: '#9ca3af' }}>
                          {statusConfig[row.status]?.label ?? row.status}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Hành động */}
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'flex-end' }}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton size="small" sx={{ color: '#6b7280', '&:hover': { color: '#818cf8' } }} onClick={() => onViewDetail(row)}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bỏ qua cảnh báo">
                          <IconButton size="small" sx={{ color: '#6b7280', '&:hover': { color: '#f59e0b' } }} onClick={() => onIgnore(row.id)}>
                            <CancelOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Đánh dấu đã xử lý">
                          <IconButton size="small" sx={{ color: '#6b7280', '&:hover': { color: '#22c55e' } }} onClick={() => onResolve(row.id)}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hành động khác">
                          <IconButton size="small" sx={{ color: '#6b7280', '&:hover': { color: '#9ca3af' } }} onClick={(e) => openMenu(e, row)}>
                            <MoreVertIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Expand row chi tiết */}
                  {isExpanded && (
                    <TableRow key={`${row.id}-expand`}>
                      <TableCell colSpan={13} sx={{ bgcolor: '#080a10', borderColor: '#1e2330', py: 0 }}>
                        <Box sx={{
                          p: 2,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: 2,
                          animation: 'alertSlideIn 0.3s ease-out',
                        }}>
                          <Box>
                            <Typography sx={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>THÔNG TIN GIAO DỊCH</Typography>
                            <InfoItem label="Mã GD"     value={row.txId} />
                            <InfoItem label="Loại"      value={row.txType} />
                            <InfoItem label="Số tiền"   value={formatAmount(row.amount)} />
                            <InfoItem label="Thời gian" value={row.createdAt} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>TÀI KHOẢN</Typography>
                            <InfoItem label="Nguồn"      value={row.nameOrig} />
                            <InfoItem label="Đích"        value={row.nameDest} />
                            <InfoItem label="Người xử lý" value={row.assignee} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>PHÂN TÍCH RỦI RO</Typography>
                            <InfoItem label="Risk Score" value={`${row.riskScore}/10`} />
                            <InfoItem label="Priority"   value={`${row.priorityScore}/100`} />
                            <InfoItem label="Mức rủi ro" value={riskLabels[row.riskLevel]} />
                            <InfoItem label="SLA"        value={row.slaStatus} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>LÝ DO BỊ FLAG</Typography>
                            {(row.modelExplanation ?? []).map((reason, i) => (
                              <Typography key={i} sx={{ fontSize: '12px', color: '#e2e8f0', mb: 0.25 }}>• {reason}</Typography>
                            ))}
                            {(!row.modelExplanation || row.modelExplanation.length === 0) && (
                              <Typography sx={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>Không có thông tin giải thích</Typography>
                            )}
                          </Box>
                          {row.details && Object.keys(row.details).length > 0 && (
                            <Box sx={{ gridColumn: '1 / -1' }}>
                              <Typography sx={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', mb: 0.5 }}>DỮ LIỆU THÔ (JSONB)</Typography>
                              <Box sx={{ p: 1, bgcolor: '#0d1117', borderRadius: 1, border: '1px solid #1e2330', maxHeight: 120, overflow: 'auto' }}>
                                <pre style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>
                                  {JSON.stringify(row.details, null, 2)}
                                </pre>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )
            })}

            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 6, borderColor: '#1e2330' }}>
                  <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>
                    Không có cảnh báo nào phù hợp bộ lọc
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MoreVert dropdown menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        PaperProps={{
          sx: {
            bgcolor: '#111827',
            border: '1px solid #1e2330',
            borderRadius: '8px',
            minWidth: 190,
            '& .MuiMenuItem-root': {
              fontSize: '13px', color: '#9ca3af', gap: 1.5, py: 1,
              '&:hover': { bgcolor: '#1a2035', color: '#e2e8f0' },
            },
          },
        }}
      >
        <MenuItem onClick={() => { if (menuRow) onViewDetail(menuRow); closeMenu() }}>
          <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
          Xem chi tiết
        </MenuItem>
        <MenuItem
          onClick={async () => { if (menuRow) await onMarkFraud(menuRow.id); closeMenu() }}
          sx={{ color: '#ef4444 !important' }}
        >
          <GppBadOutlinedIcon sx={{ fontSize: 16 }} />
          Xác nhận gian lận
        </MenuItem>
        <MenuItem
          onClick={async () => { if (menuRow) await onMarkLegit(menuRow.id); closeMenu() }}
          sx={{ color: '#22c55e !important' }}
        >
          <VerifiedOutlinedIcon sx={{ fontSize: 16 }} />
          Đánh dấu hợp lệ
        </MenuItem>
        <MenuItem onClick={() => { if (menuRow) onAddComment(menuRow.id); closeMenu() }}>
          <CommentOutlinedIcon sx={{ fontSize: 16 }} />
          Thêm comment
        </MenuItem>
        <MenuItem onClick={() => { if (menuRow) onAssign(menuRow.id); closeMenu() }}>
          <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
          Phân công xử lý
        </MenuItem>
        <MenuItem
          onClick={() => { if (menuRow) { onEscalate(menuRow.id); closeMenu() } }}
          sx={{ color: '#ef4444 !important' }}
        >
          <PriorityHighIcon sx={{ fontSize: 16 }} />
          Escalate
        </MenuItem>
      </Menu>

      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={(_e, p) => onPageChange(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={() => {}}
        labelRowsPerPage="Hàng/trang:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
        rowsPerPageOptions={[10]}
        sx={{
          borderTop: '1px solid #1e2330',
          '& .MuiTablePagination-toolbar': { color: '#6b7280' },
          '& .MuiTablePagination-selectIcon': { color: '#6b7280' },
        }}
      />
    </Box>
  )
}