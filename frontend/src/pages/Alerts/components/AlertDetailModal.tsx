// Modal hiển thị chi tiết một cảnh báo — mở overlay, không chuyển trang
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import CloseIcon from '@mui/icons-material/Close'
import { alpha } from '@mui/material/styles'
import { tokens } from '../../../theme'
import type { AlertRecord } from '../types'
import { riskLabels, statusConfig } from '../types'

interface AlertDetailModalProps {
  open:      boolean
  alert:     AlertRecord | null
  onClose:   () => void
  onIgnore:  (id: string) => Promise<void>
  onResolve: (id: string) => Promise<void>
}

// Format số tiền → VND
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

// Hàng thông tin trong modal
function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
      <Typography sx={{ fontSize: '12px', color: '#6b7280', minWidth: 120 }}>{label}</Typography>
      <Typography sx={{ fontSize: '13px', color: '#e2e8f0', fontFamily: 'monospace', textAlign: 'right', wordBreak: 'break-all' }}>
        {value ?? '—'}
      </Typography>
    </Box>
  )
}

export function AlertDetailModal({ open, alert, onClose, onIgnore, onResolve }: AlertDetailModalProps) {
  if (!alert) return null

  const riskColor = tokens.risk[alert.riskLevel]
  const scorePercent = (alert.riskScore / 10) * 100

  // Xử lý ignore — đóng modal sau khi thành công
  const handleIgnore = async () => {
    await onIgnore(alert.id)
    onClose()
  }

  // Xử lý resolve — đóng modal sau khi thành công
  const handleResolve = async () => {
    await onResolve(alert.id)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: '#0d1117',
          border: '1px solid #1e2330',
          borderRadius: '12px',
          color: '#e2e8f0',
        },
      }}
    >
      {/* ── Tiêu đề ── */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1e2330',
          px: 3,
          py: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>
            Chi tiết cảnh báo
          </Typography>
          <Typography sx={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', mt: 0.25 }}>
            #{alert.id}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#6b7280' }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      {/* ── Nội dung ── */}
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>

          {/* Cột trái — Thông tin giao dịch */}
          <Box sx={{ p: 3, borderRight: { sm: '1px solid #1e2330' } }}>
            <Typography sx={{ fontSize: '10px', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, mb: 1.5 }}>
              Thông tin giao dịch
            </Typography>
            <InfoRow label="Mã giao dịch" value={alert.txId} />
            <InfoRow label="Loại giao dịch" value={alert.txType} />
            <InfoRow label="Số tiền" value={formatAmount(alert.amount)} />
            <InfoRow label="Thời gian" value={alert.createdAt} />
            <Divider sx={{ borderColor: '#1e2330', my: 1.5 }} />
            <Typography sx={{ fontSize: '10px', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, mb: 1.5 }}>
              Người gửi / Nhận
            </Typography>
            <InfoRow label="Người gửi" value={alert.nameOrig} />
            <InfoRow label="Người nhận" value={alert.nameDest} />
          </Box>

          {/* Cột phải — Phân tích rủi ro */}
          <Box sx={{ p: 3 }}>
            <Typography sx={{ fontSize: '10px', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, mb: 1.5 }}>
              Phân tích rủi ro
            </Typography>

            {/* Risk score + progress bar */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.75 }}>
                <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: riskColor, lineHeight: 1 }}>
                  {alert.riskScore.toFixed(1)}
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>/ 10</Typography>
              </Box>
              {/* Progress bar */}
              <Box sx={{ height: 6, bgcolor: '#1e2330', borderRadius: 3 }}>
                <Box
                  sx={{
                    width: `${scorePercent}%`,
                    height: '100%',
                    bgcolor: riskColor,
                    borderRadius: 3,
                    transition: 'width 0.4s ease',
                    boxShadow: `0 0 8px ${alpha(riskColor, 0.5)}`,
                  }}
                />
              </Box>
            </Box>

            {/* Chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                label={riskLabels[alert.riskLevel].toUpperCase()}
                size="small"
                sx={{
                  bgcolor: alpha(riskColor, 0.14),
                  color: riskColor,
                  border: `1px solid ${alpha(riskColor, 0.3)}`,
                  fontWeight: 700,
                  fontSize: '10px',
                  height: 22,
                }}
              />
              <Chip
                label={statusConfig[alert.status].label}
                size="small"
                sx={{
                  bgcolor: '#1e2330',
                  color: '#9ca3af',
                  border: '1px solid #273449',
                  fontSize: '10px',
                  height: 22,
                }}
              />
            </Box>

            <Divider sx={{ borderColor: '#1e2330', my: 1.5 }} />

            <Typography sx={{ fontSize: '10px', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, mb: 1.5 }}>
              Người xử lý
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#e2e8f0' }}>
              {alert.assignee}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* ── Hành động ── */}
      <DialogActions
        sx={{
          borderTop: '1px solid #1e2330',
          px: 3,
          py: 2,
          gap: 1,
          justifyContent: 'flex-end',
        }}
      >
        <Button
          size="small"
          onClick={onClose}
          sx={{
            color: '#6b7280',
            border: '1px solid #1e2330',
            textTransform: 'none',
            fontSize: '12px',
            '&:hover': { bgcolor: '#1a2035' },
          }}
        >
          Đóng
        </Button>
        <Button
          size="small"
          onClick={handleIgnore}
          sx={{
            color: '#f59e0b',
            border: '1px solid rgba(245,158,11,0.3)',
            textTransform: 'none',
            fontSize: '12px',
            '&:hover': { bgcolor: 'rgba(245,158,11,0.08)' },
          }}
        >
          Bỏ qua
        </Button>
        <Button
          size="small"
          onClick={handleResolve}
          sx={{
            color: '#22c55e',
            border: '1px solid rgba(34,197,94,0.3)',
            textTransform: 'none',
            fontSize: '12px',
            '&:hover': { bgcolor: 'rgba(34,197,94,0.08)' },
          }}
        >
          Đánh dấu đã xử lý
        </Button>
      </DialogActions>
    </Dialog>
  )
}
