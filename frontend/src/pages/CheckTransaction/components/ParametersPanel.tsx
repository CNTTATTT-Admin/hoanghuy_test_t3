import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import type { TransactionForm, TransactionType, Currency } from '../types'
import { TX_TYPES, CURRENCIES } from '../types'
import { TypeSpecificFields } from './TypeSpecificFields'

/* ── Shared input styles ── */
const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#0d1117',
    borderRadius: '6px',
    '& fieldset': { borderColor: '#1e2330' },
    '&:hover fieldset': { borderColor: '#2a3040' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
  },
  '& .MuiInputLabel-root': {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6b7280',
    letterSpacing: '1.2px',
    textTransform: 'uppercase' as const,
  },
  '& .MuiInputBase-input': {
    color: '#fff',
  },
} as const

interface ParametersPanelProps {
  form: TransactionForm
  loading: boolean
  onChange: (field: keyof TransactionForm, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  sessionHistory?: { amount: number }[]
}

export function ParametersPanel({ form, loading, onChange, onSubmit, sessionHistory }: ParametersPanelProps) {
  const history     = sessionHistory ?? []
  const total24h    = history.reduce((sum, tx) => sum + tx.amount, 0)
  const avgTicket   = history.length > 0 ? total24h / history.length : 0
  const sessionProgress = Math.min((history.length / 20) * 100, 100)
  return (
    <Box
      sx={{
        bgcolor: '#0d1117',
        border: '1px solid #1e2330',
        borderRadius: '8px',
        p: 2.5,
      }}
    >
      {/* Section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <ViewListOutlinedIcon sx={{ fontSize: 14, color: '#6b7280', mb: 1.3 }} />
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#6b7280',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            mb: 1
          }}
        >
          THAM SỐ
        </Typography>
      </Box>

      <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* 1. User Identifier */}
        <TextField
          label="Mã người dùng"
          value={form.userId}
          onChange={e => onChange('userId', e.target.value)}
          placeholder=""
          size="small"
          fullWidth
          sx={inputSx}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: '#6b7280', fontSize: 13, fontWeight: 600 }}>⊕</Typography>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* 2. Transaction Type + Currency */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            select
            label="Loại giao dịch"
            value={form.type}
            onChange={e => onChange('type', e.target.value)}
            size="small"
            sx={{ ...inputSx, flex: 6 }}
          >
            {TX_TYPES.map((t: TransactionType) => (
              <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Tiền tệ"
            value={form.currency}
            onChange={e => onChange('currency', e.target.value)}
            size="small"
            sx={{ ...inputSx, flex: 4 }}
          >
            {CURRENCIES.map((c: Currency) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Trường bổ sung hiển thị có điều kiện theo loại giao dịch */}
        <TypeSpecificFields
          form={form}
          onChange={onChange}
          disabled={loading}
        />

        {/* 3. Amount */}
        <TextField
          label="Số tiền"
          value={form.amount}
          onChange={e => onChange('amount', e.target.value)}
          type="number"
          size="small"
          fullWidth
          sx={inputSx}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: '#6b7280', fontSize: 14, fontWeight: 600 }}>$</Typography>
                </InputAdornment>
              ),
            },
            htmlInput: { min: 0 },
          }}
        />

        {/* 4. Current Balance (Số dư tài khoản nguồn) */}
        <TextField
          label="Số dư hiện tại (tài khoản nguồn)"
          value={form.balance}
          onChange={e => onChange('balance', e.target.value)}
          type="number"
          size="small"
          fullWidth
          sx={inputSx}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: '#6b7280', fontSize: 14, fontWeight: 600 }}>$</Typography>
                </InputAdornment>
              ),
            },
            htmlInput: { min: 0 },
          }}
        />

        {/* 4b. Destination Balance — quan trọng cho ML model (feature: dest_is_empty) */}
        <TextField
          label="Số dư tài khoản đích"
          value={form.balanceDest}
          onChange={e => onChange('balanceDest', e.target.value)}
          type="number"
          size="small"
          fullWidth
          sx={inputSx}
          helperText="Số dư tài khoản đích trước GD. Để 0 nếu là tài khoản mới (tăng mức nghi ngờ gian lận)."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: '#6b7280', fontSize: 14, fontWeight: 600 }}>$</Typography>
                </InputAdornment>
              ),
            },
            htmlInput: { min: 0 },
            formHelperText: {
              sx: { color: '#6b7280', fontSize: '10px', mt: 0.5 },
            },
          }}
        />

        {/* 5. Execution Timestamp — realtime, chỉ đọc */}
        <Box sx={{ position: 'relative' }}>
          <TextField
            label="Thời điểm thực hiện"
            value={new Date(form.timestamp).toLocaleString('vi-VN', {
              dateStyle: 'short',
              timeStyle: 'medium',
            })}
            size="small"
            fullWidth
            sx={{
              ...inputSx,
              '& .MuiInputBase-input': { color: '#22c55e', fontFamily: 'monospace', fontSize: '12px' },
            }}
            slotProps={{
              input: {
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeOutlinedIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* Submit button */}
        <Button
          type="submit"
          fullWidth
          disabled={loading}
          startIcon={
            loading
              ? <CircularProgress size={16} sx={{ color: '#fff' }} />
              : <PlayArrowOutlinedIcon />
          }
          sx={{
            mt: 0.5,
            bgcolor: '#12151f',
            border: '1px solid #2a3040',
            color: '#fff',
            fontWeight: 600,
            py: 1.4,
            textTransform: 'none',
            '&:hover': { bgcolor: '#1a2035' },
            '&.Mui-disabled': { color: '#6b7280' },
          }}
        >
          {loading ? 'Đang phân tích...' : 'Chạy đánh giá chẩn đoán'}
        </Button>
      </Box>

      {/* ── Historical Context ── */}
      <Divider sx={{ my: 2.5, borderColor: '#1e2330' }} />

      <Typography
        sx={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#6b7280',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          mb: 2,
        }}
      >
        BỐI CẢNH LỊCH SỬ
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>Khối lượng phiên</Typography>
        <Typography sx={{ fontSize: '13px', color: '#818cf8', fontWeight: 600 }}>
          {history.length === 0
            ? '—'
            : `$${total24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>Vé trung bình</Typography>
        <Typography sx={{ fontSize: '13px', color: '#818cf8', fontWeight: 600 }}>
          {history.length === 0
            ? '—'
            : `$${avgTicket.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={sessionProgress}
        sx={{
          height: 3,
          borderRadius: 2,
          bgcolor: '#1e2330',
          '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' },
        }}
      />
    </Box>
  )
}
