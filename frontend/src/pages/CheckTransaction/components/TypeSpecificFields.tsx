import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import type { TransactionForm } from '../types'

interface Props {
  form:      TransactionForm
  onChange:  (field: keyof TransactionForm, value: string) => void
  disabled?: boolean
}

const fieldsetSx = (color: string) => ({
  mt: 2,
  p: 2,
  borderRadius: '10px',
  border: `1px solid ${color}30`,
  bgcolor: `${color}08`,
})

const legendSx = (color: string) => ({
  fontSize: '10px',
  fontWeight: 700,
  color,
  letterSpacing: '1.2px',
  textTransform: 'uppercase' as const,
  mb: 1.5,
})

const inputSx = (accentColor: string) => ({
  '& .MuiOutlinedInput-root': {
    bgcolor: '#0d1117',
    borderRadius: '6px',
    '& fieldset': { borderColor: '#1e2330' },
    '&:hover fieldset': { borderColor: '#2a3040' },
    '&.Mui-focused fieldset': { borderColor: accentColor },
  },
  '& .MuiInputLabel-root': {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6b7280',
    letterSpacing: '1.2px',
    textTransform: 'uppercase' as const,
  },
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiSelect-icon': { color: '#6b7280' },
})

/**
 * Hiển thị các trường bổ sung tùy theo loại giao dịch được chọn.
 * Trả về null cho DEBIT và PAYMENT (không có trường đặc thù).
 */
export function TypeSpecificFields({ form, onChange, disabled }: Props) {
  // ══════════════════════════════════════════════════════════════
  // TRANSFER — Chuyển khoản
  // ══════════════════════════════════════════════════════════════
  if (form.type === 'TRANSFER') {
    return (
      <Box sx={fieldsetSx('#06b6d4')}>
        <Typography sx={legendSx('#06b6d4')}>Thông tin chuyển khoản</Typography>

        {/* Số tài khoản nhận — BẮT BUỘC */}
        <TextField
          label="Số tài khoản nhận *"
          value={form.receiverAccount}
          onChange={e => onChange('receiverAccount', e.target.value)}
          placeholder="Nhập số tài khoản người nhận"
          size="small"
          fullWidth
          disabled={disabled}
          inputMode="numeric"
          autoComplete="off"
          sx={{ ...inputSx('#06b6d4'), mb: 1.5 }}
        />

        {/* Tên người nhận — TÙY CHỌN */}
        <TextField
          label="Tên người nhận (tùy chọn)"
          value={form.receiverName}
          onChange={e => onChange('receiverName', e.target.value)}
          placeholder="Nhập tên người nhận (nếu có)"
          size="small"
          fullWidth
          disabled={disabled}
          autoComplete="off"
          sx={inputSx('#06b6d4')}
        />
      </Box>
    )
  }

  // ══════════════════════════════════════════════════════════════
  // CASH_OUT — Rút tiền mặt
  // ══════════════════════════════════════════════════════════════
  if (form.type === 'CASH_OUT') {
    return (
      <Box sx={fieldsetSx('#f97316')}>
        <Typography sx={legendSx('#f97316')}>Thông tin rút tiền</Typography>

        {/* Hình thức rút — BẮT BUỘC */}
        <TextField
          select
          label="Hình thức rút tiền *"
          value={form.withdrawalMethod}
          onChange={e => onChange('withdrawalMethod', e.target.value)}
          size="small"
          fullWidth
          disabled={disabled}
          sx={inputSx('#f97316')}
        >
          <MenuItem value="" disabled>— Chọn hình thức rút —</MenuItem>
          <MenuItem value="ATM">ATM — Rút tại máy ATM</MenuItem>
          <MenuItem value="COUNTER">Quầy giao dịch — Rút tại quầy ngân hàng</MenuItem>
        </TextField>
      </Box>
    )
  }

  // ══════════════════════════════════════════════════════════════
  // CASH_IN — Nạp tiền / Gửi tiền
  // ══════════════════════════════════════════════════════════════
  if (form.type === 'CASH_IN') {
    return (
      <Box sx={fieldsetSx('#22c55e')}>
        <Typography sx={legendSx('#22c55e')}>Thông tin nạp tiền</Typography>

        {/* Nguồn tiền — BẮT BUỘC */}
        <TextField
          select
          label="Nguồn tiền *"
          value={form.fundSource}
          onChange={e => onChange('fundSource', e.target.value)}
          size="small"
          fullWidth
          disabled={disabled}
          sx={inputSx('#22c55e')}
        >
          <MenuItem value="" disabled>— Chọn nguồn tiền —</MenuItem>
          <MenuItem value="CASH">Tiền mặt</MenuItem>
          <MenuItem value="BANK">Chuyển khoản ngân hàng</MenuItem>
          <MenuItem value="WALLET">Ví điện tử</MenuItem>
        </TextField>
      </Box>
    )
  }

  // DEBIT / PAYMENT — không có trường đặc thù
  return null
}
