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
import type { AlertRecord } from '../types'
import { riskLabels, statusConfig } from '../types'
import { TxTypeBadge } from '../../../components/TxTypeBadge'

interface AlertTableProps {
  data:          AlertRecord[]
  page:          number
  rowsPerPage:   number
  onPageChange:  (page: number) => void
  onViewDetail:  (row: AlertRecord) => void
  onIgnore:      (id: string) => Promise<void>
  onResolve:     (id: string) => Promise<void>
  onEscalate:    (id: string) => void
}

export function AlertTable({
  data, page, rowsPerPage, onPageChange,
  onViewDetail, onIgnore, onResolve, onEscalate,
}: AlertTableProps) {
  const paged = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // State cho MoreVert menu
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [menuRow,    setMenuRow]    = useState<AlertRecord | null>(null)

  const openMenu  = (e: React.MouseEvent<HTMLElement>, row: AlertRecord) => {
    e.stopPropagation()   // không trigger row click
    setMenuAnchor(e.currentTarget)
    setMenuRow(row)
  }
  const closeMenu = () => { setMenuAnchor(null); setMenuRow(null) }

  return (
    <Box
      sx={{
        bgcolor: '#0d1117',
        border: '1px solid #1e2330',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
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
              <TableCell>THỜI GIAN</TableCell>
              <TableCell>MÃ GIAO DỊCH</TableCell>
              <TableCell align="center">LOẠI GD</TableCell>
              <TableCell align="center">MỨC RỦI RO</TableCell>
              <TableCell align="center">TRẠNG THÁI</TableCell>
              <TableCell align="right">HÀNH ĐỘNG</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row) => {
              const riskColor = tokens.risk[row.riskLevel]
              return (
                <TableRow
                  key={row.id}
                  onClick={() => onViewDetail(row)}
                  sx={{
                    cursor: 'pointer',
                    '& td': { borderColor: '#1e2330', py: 1.5 },
                    // Highlight critical — viền trái đỏ
                    ...(row.riskLevel === 'critical' && {
                      borderLeft: `3px solid ${tokens.risk.critical}`,
                      bgcolor: 'rgba(239,68,68,0.04)',
                    }),
                    // Highlight high — viền trái cam
                    ...(row.riskLevel === 'high' && {
                      borderLeft: `3px solid ${tokens.risk.high}`,
                      bgcolor: 'rgba(249,115,22,0.03)',
                    }),
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                    '&:last-child td': { border: 0 },
                  }}
                >
                  {/* Thời gian */}
                  <TableCell>
                    <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>
                      {row.createdAt}
                    </Typography>
                  </TableCell>

                  {/* Mã giao dịch — click mở modal */}
                  <TableCell>
                    <Typography
                      onClick={(e) => { e.stopPropagation(); onViewDetail(row) }}
                      sx={{
                        fontSize: '13px',
                        color: '#818cf8',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {row.txId}
                    </Typography>
                  </TableCell>

                  {/* Loại giao dịch */}
                  <TableCell align="center">
                    <TxTypeBadge type={row.txType} />
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
                        fontWeight: 700,
                        fontSize: '10px',
                        letterSpacing: '0.5px',
                        height: 22,
                      }}
                    />
                  </TableCell>

                  {/* Trạng thái */}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: statusConfig[row.status].color === 'warning' ? '#f59e0b'
                            : statusConfig[row.status].color === 'info' ? '#3b82f6'
                            : statusConfig[row.status].color === 'success' ? '#22c55e'
                            : statusConfig[row.status].color === 'error' ? '#ef4444'
                            : '#6b7280',
                        }}
                      />
                      <Typography sx={{ fontSize: '12px', color: '#9ca3af' }}>
                        {statusConfig[row.status].label}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Hành động */}
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'flex-end' }}>
                      {/* Eye — xem chi tiết */}
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          sx={{ color: '#6b7280', '&:hover': { color: '#818cf8' } }}
                          onClick={() => onViewDetail(row)}
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>

                      {/* X — bỏ qua cảnh báo */}
                      <Tooltip title="Bỏ qua cảnh báo">
                        <IconButton
                          size="small"
                          sx={{ color: '#6b7280', '&:hover': { color: '#f59e0b' } }}
                          onClick={() => onIgnore(row.id)}
                        >
                          <CancelOutlinedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>

                      {/* Check — đánh dấu đã xử lý */}
                      <Tooltip title="Đánh dấu đã xử lý">
                        <IconButton
                          size="small"
                          sx={{ color: '#6b7280', '&:hover': { color: '#22c55e' } }}
                          onClick={() => onResolve(row.id)}
                        >
                          <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>

                      {/* MoreVert — hành động nâng cao */}
                      <Tooltip title="Hành động khác">
                        <IconButton
                          size="small"
                          sx={{ color: '#6b7280', '&:hover': { color: '#9ca3af' } }}
                          onClick={(e) => openMenu(e, row)}
                        >
                          <MoreVertIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}

            {/* Trạng thái rỗng */}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, borderColor: '#1e2330' }}>
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
            minWidth: 180,
            '& .MuiMenuItem-root': {
              fontSize: '13px',
              color: '#9ca3af',
              gap: 1.5,
              py: 1,
              '&:hover': { bgcolor: '#1a2035', color: '#e2e8f0' },
            },
          },
        }}
      >
        <MenuItem onClick={() => { if (menuRow) onViewDetail(menuRow); closeMenu() }}>
          <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
          Xem chi tiết
        </MenuItem>
        <MenuItem onClick={closeMenu}>
          <CommentOutlinedIcon sx={{ fontSize: 16 }} />
          Thêm comment
        </MenuItem>
        <MenuItem onClick={closeMenu}>
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
