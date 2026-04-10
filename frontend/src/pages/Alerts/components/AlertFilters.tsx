import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import FilterListOffOutlinedIcon from '@mui/icons-material/FilterListOffOutlined'
import type { RiskLevel, AlertStatus } from '../types'
import { riskLabels, statusConfig } from '../types'

// Danh sách loại giao dịch có thể filter
const TX_TYPES = ['TRANSFER', 'CASH_OUT', 'PAYMENT', 'CASH_IN', 'DEBIT', 'UNKNOWN'] as const

interface AlertFiltersProps {
  search:         string
  filterRisk:     string
  filterStatus:   string
  filterTxType:   string
  onSearchChange:  (val: string) => void
  onRiskChange:    (val: string) => void
  onStatusChange:  (val: string) => void
  onTxTypeChange:  (val: string) => void
  onReset:         () => void
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#0d1117',
    borderRadius: '6px',
    '& fieldset': { borderColor: '#1e2330' },
    '&:hover fieldset': { borderColor: '#2a3040' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
  },
  '& .MuiInputLabel-root': {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6b7280',
    letterSpacing: '0.5px',
  },
  '& .MuiInputBase-input': {
    color: '#fff',
    fontSize: '13px',
  },
} as const

export function AlertFilters({
  search,
  filterRisk,
  filterStatus,
  filterTxType,
  onSearchChange,
  onRiskChange,
  onStatusChange,
  onTxTypeChange,
  onReset,
}: AlertFiltersProps) {
  const hasActiveFilter = search !== '' || filterRisk !== 'all' || filterStatus !== 'all' || filterTxType !== 'all'

  return (
    <Box
      sx={{
        bgcolor: '#0d1117',
        border: '1px solid #1e2330',
        borderRadius: '8px',
        p: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      {/* Tìm kiếm — match txId, mã alert, tên người gửi/nhận */}
      <TextField
        size="small"
        placeholder="Tìm theo mã GD, tài khoản..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ ...inputSx, flex: { xs: '1 1 100%', sm: '1 1 200px' }, maxWidth: { sm: 280 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ color: '#6b7280', fontSize: 18 }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Mức rủi ro */}
      <TextField
        select
        size="small"
        label="Mức rủi ro"
        value={filterRisk}
        onChange={(e) => onRiskChange(e.target.value)}
        sx={{ ...inputSx, minWidth: 140, flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
      >
        <MenuItem value="all">Tất cả</MenuItem>
        {(['critical', 'high', 'medium', 'low'] as RiskLevel[]).map((r) => (
          <MenuItem key={r} value={r}>{riskLabels[r]}</MenuItem>
        ))}
      </TextField>

      {/* Trạng thái */}
      <TextField
        select
        size="small"
        label="Trạng thái"
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        sx={{ ...inputSx, minWidth: 140, flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
      >
        <MenuItem value="all">Tất cả</MenuItem>
        {(Object.keys(statusConfig) as AlertStatus[]).map((s) => (
          <MenuItem key={s} value={s}>{statusConfig[s].label}</MenuItem>
        ))}
      </TextField>

      {/* Loại giao dịch */}
      <TextField
        select
        size="small"
        label="Loại GD"
        value={filterTxType}
        onChange={(e) => onTxTypeChange(e.target.value)}
        sx={{ ...inputSx, minWidth: 140, flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
      >
        <MenuItem value="all">Tất cả</MenuItem>
        {TX_TYPES.map((t) => (
          <MenuItem key={t} value={t}>{t === 'UNKNOWN' ? 'Không xác định' : t}</MenuItem>
        ))}
      </TextField>

      {/* Reset */}
      {hasActiveFilter && (
        <Button
          size="small"
          onClick={onReset}
          startIcon={<FilterListOffOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{
            color: '#9ca3af',
            border: '1px solid #1e2330',
            borderRadius: '6px',
            textTransform: 'none',
            fontSize: '12px',
            px: 1.5,
            '&:hover': { bgcolor: '#1a2035', borderColor: '#2a3040' },
          }}
        >
          Xóa bộ lọc
        </Button>
      )}
    </Box>
  )
}
