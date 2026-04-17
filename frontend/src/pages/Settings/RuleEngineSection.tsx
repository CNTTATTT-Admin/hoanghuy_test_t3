/**
 * RuleEngineSection.tsx — UI quản lý Rule Engine trong trang Settings.
 * Hiển thị bảng rules, dialog tạo/sửa rule với conditions builder.
 */
import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../../services/apiClient'

// ── Types ─────────────────────────────────────────────────────────────────────
interface RuleCondition {
  field:    string
  operator: string
  value:    string | number | number[]
}

interface RuleResponse {
  rule_id:     string
  name:        string
  description: string | null
  conditions:  RuleCondition[]
  action:      'ALLOW' | 'BLOCK' | 'REVIEW'
  priority:    number
  is_enabled:  boolean
  created_by:  string | null
  created_at:  string | null
  updated_at:  string | null
}

interface RulesListResponse {
  rules: RuleResponse[]
  total: number
}

// ── Constants ─────────────────────────────────────────────────────────────────
const VALID_FIELDS = [
  { value: 'amount',            label: 'Số tiền (amount)' },
  { value: 'transaction_type',  label: 'Loại GD (transaction_type)' },
  { value: 'balance_ratio',     label: 'Tỷ lệ số dư (balance_ratio)' },
  { value: 'time_of_day',       label: 'Giờ trong ngày (time_of_day)' },
  { value: 'velocity',          label: 'Tốc độ GD (velocity)' },
  { value: 'fraud_probability', label: 'Xác suất gian lận (fraud_probability)' },
  { value: 'risk_score',        label: 'Risk score' },
]

const NUMERIC_FIELDS = ['amount', 'balance_ratio', 'time_of_day', 'velocity', 'fraud_probability', 'risk_score']
const STRING_FIELDS  = ['transaction_type']

const NUMERIC_OPERATORS = ['>', '>=', '<', '<=', '==', '!=', 'between']
const STRING_OPERATORS  = ['==', '!=', 'in', 'not_in']

const TRANSACTION_TYPES = ['PAYMENT', 'TRANSFER', 'CASH_OUT', 'CASH_IN', 'DEBIT']

const ACTION_COLORS: Record<string, 'success' | 'error' | 'warning'> = {
  ALLOW:  'success',
  BLOCK:  'error',
  REVIEW: 'warning',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getOperatorsForField(field: string): string[] {
  return STRING_FIELDS.includes(field) ? STRING_OPERATORS : NUMERIC_OPERATORS
}

function isNumericField(field: string): boolean {
  return NUMERIC_FIELDS.includes(field)
}

function conditionLabel(cond: RuleCondition): string {
  const val = Array.isArray(cond.value) ? cond.value.join('–') : cond.value
  return `${cond.field} ${cond.operator} ${val}`
}

// ── Empty condition factory ───────────────────────────────────────────────────
function emptyCondition(): RuleCondition {
  return { field: 'amount', operator: '>', value: 0 }
}

// ── Condition Row Component ───────────────────────────────────────────────────
interface ConditionRowProps {
  condition: RuleCondition
  index:     number
  onChange:  (index: number, updated: RuleCondition) => void
  onDelete:  (index: number) => void
}

function ConditionRow({ condition, index, onChange, onDelete }: ConditionRowProps) {
  const operators = getOperatorsForField(condition.field)
  const isNumeric = isNumericField(condition.field)
  const isBetween = condition.operator === 'between'
  const isIn      = condition.operator === 'in' || condition.operator === 'not_in'
  const isString  = condition.field === 'transaction_type'

  const handleField = (field: string) => {
    const newOps = getOperatorsForField(field)
    const op     = newOps.includes(condition.operator) ? condition.operator : newOps[0]
    onChange(index, { ...condition, field, operator: op, value: isNumericField(field) ? 0 : '' })
  }

  const handleOperator = (operator: string) => {
    const value = operator === 'between' ? [0, 0] : isNumericField(condition.field) ? 0 : ''
    onChange(index, { ...condition, operator, value })
  }

  const handleValueChange = (raw: string) => {
    if (isBetween) {
      const [a, b] = raw.split(',')
      onChange(index, { ...condition, value: [Number(a ?? 0), Number(b ?? 0)] })
    } else if (isNumeric) {
      onChange(index, { ...condition, value: Number(raw) })
    } else {
      onChange(index, { ...condition, value: raw })
    }
  }

  const valueString = isBetween
    ? (Array.isArray(condition.value) ? condition.value.join(',') : '')
    : String(condition.value ?? '')

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Field */}
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Trường</InputLabel>
        <Select value={condition.field} label="Trường" onChange={(e) => handleField(e.target.value)}>
          {VALID_FIELDS.map((f) => (
            <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Operator */}
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <InputLabel>Toán tử</InputLabel>
        <Select value={condition.operator} label="Toán tử" onChange={(e) => handleOperator(e.target.value)}>
          {operators.map((op) => <MenuItem key={op} value={op}>{op}</MenuItem>)}
        </Select>
      </FormControl>

      {/* Value */}
      {isString && !isIn ? (
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Giá trị</InputLabel>
          <Select
            value={String(condition.value ?? '')}
            label="Giá trị"
            onChange={(e) => onChange(index, { ...condition, value: e.target.value })}
          >
            {TRANSACTION_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
      ) : (
        <TextField
          size="small"
          label={isBetween ? 'Min,Max (vd: 0,5)' : 'Giá trị'}
          value={valueString}
          onChange={(e) => handleValueChange(e.target.value)}
          type={isNumeric && !isBetween ? 'number' : 'text'}
          sx={{ width: isBetween ? 160 : 120 }}
          placeholder={isBetween ? '0,5' : undefined}
        />
      )}

      <Tooltip title="Xóa điều kiện">
        <IconButton onClick={() => onDelete(index)} size="small" color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

// ── Rule Dialog ───────────────────────────────────────────────────────────────
interface RuleDialogProps {
  open:      boolean
  editing:   RuleResponse | null
  onClose:   () => void
  onSaved:   () => void
}

function RuleDialog({ open, editing, onClose, onSaved }: RuleDialogProps) {
  const [name, setName]             = useState('')
  const [description, setDesc]      = useState('')
  const [action, setAction]         = useState<'ALLOW' | 'BLOCK' | 'REVIEW'>('REVIEW')
  const [priority, setPriority]     = useState(100)
  const [isEnabled, setIsEnabled]   = useState(true)
  const [conditions, setConditions] = useState<RuleCondition[]>([emptyCondition()])
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setDesc(editing.description ?? '')
      setAction(editing.action)
      setPriority(editing.priority)
      setIsEnabled(editing.is_enabled)
      setConditions(editing.conditions.length > 0 ? editing.conditions : [emptyCondition()])
    } else {
      setName(''); setDesc(''); setAction('REVIEW'); setPriority(100)
      setIsEnabled(true); setConditions([emptyCondition()])
    }
    setError('')
  }, [editing, open])

  const handleConditionChange = (i: number, updated: RuleCondition) => {
    setConditions((prev) => prev.map((c, idx) => idx === i ? updated : c))
  }

  const handleConditionDelete = (i: number) => {
    setConditions((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Tên rule không được để trống'); return }
    if (conditions.length === 0) { setError('Cần ít nhất 1 điều kiện'); return }
    setSaving(true); setError('')
    try {
      const payload = { name: name.trim(), description: description.trim() || null, conditions, action, priority, is_enabled: isEnabled }
      if (editing) {
        await apiPut(`/api/v1/rules/${editing.rule_id}`, payload)
      } else {
        await apiPost('/api/v1/rules', payload)
      }
      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lưu rule thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editing ? 'Chỉnh sửa Rule' : 'Tạo Rule mới'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Tên rule" value={name} onChange={(e) => setName(e.target.value)} size="small" fullWidth required />
          <TextField
            label="Priority (1–999)"
            value={priority}
            onChange={(e) => setPriority(Math.max(1, Math.min(999, Number(e.target.value))))}
            size="small"
            type="number"
            inputProps={{ min: 1, max: 999 }}
            sx={{ width: 160 }}
          />
        </Box>

        <TextField
          label="Mô tả (tuỳ chọn)"
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          size="small"
          fullWidth
          multiline
          rows={2}
        />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Hành động</InputLabel>
            <Select value={action} label="Hành động" onChange={(e) => setAction(e.target.value as typeof action)}>
              <MenuItem value="ALLOW"><Chip label="ALLOW" color="success" size="small" /></MenuItem>
              <MenuItem value="REVIEW"><Chip label="REVIEW" color="warning" size="small" /></MenuItem>
              <MenuItem value="BLOCK"><Chip label="BLOCK" color="error" size="small" /></MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} size="small" />
            <Typography variant="body2">{isEnabled ? 'Bật' : 'Tắt'}</Typography>
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Điều kiện (AND logic — tất cả phải thỏa mãn)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {conditions.map((cond, i) => (
              <ConditionRow
                key={i}
                condition={cond}
                index={i}
                onChange={handleConditionChange}
                onDelete={handleConditionDelete}
              />
            ))}
          </Box>
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setConditions((prev) => [...prev, emptyCondition()])}
            sx={{ mt: 1 }}
          >
            Thêm điều kiện
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Hủy</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu Rule'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export function RuleEngineSection() {
  const [rules, setRules]           = useState<RuleResponse[]>([])
  const [loading, setLoading]       = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing]       = useState<RuleResponse | null>(null)
  const [snack, setSnack]           = useState<{ msg: string; severity: 'success' | 'error' } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const loadRules = useCallback(async () => {
    try {
      const res = await apiGet<RulesListResponse>('/api/v1/rules')
      setRules(res.rules)
    } catch {
      setSnack({ msg: 'Không tải được danh sách rules', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRules() }, [loadRules])

  const handleToggle = async (rule: RuleResponse) => {
    try {
      await apiPatch(`/api/v1/rules/${rule.rule_id}/toggle`)
      setRules((prev) => prev.map((r) => r.rule_id === rule.rule_id ? { ...r, is_enabled: !r.is_enabled } : r))
    } catch {
      setSnack({ msg: 'Toggle rule thất bại', severity: 'error' })
    }
  }

  const handleDelete = async (rule_id: string) => {
    try {
      await apiDelete(`/api/v1/rules/${rule_id}`)
      setRules((prev) => prev.filter((r) => r.rule_id !== rule_id))
      setSnack({ msg: 'Đã xóa rule thành công', severity: 'success' })
    } catch {
      setSnack({ msg: 'Xóa rule thất bại', severity: 'error' })
    } finally {
      setConfirmDelete(null)
    }
  }

  return (
    <>
      <Card variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}>
        <CardHeader
          title={<Typography variant="subtitle1" fontWeight={600}>🚨 Rule Engine</Typography>}
          subheader={<Typography variant="caption" color="text.secondary">Quản lý business rules — áp dụng sau ML model</Typography>}
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => { setEditing(null); setDialogOpen(true) }}
              sx={{ mt: 1, mr: 1 }}
            >
              Thêm Rule
            </Button>
          }
          sx={{ pb: 1 }}
        />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={70}>Priority</TableCell>
                    <TableCell>Tên Rule</TableCell>
                    <TableCell>Điều kiện</TableCell>
                    <TableCell width={100} align="center">Action</TableCell>
                    <TableCell width={80} align="center">Bật</TableCell>
                    <TableCell width={90} align="center">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.disabled" sx={{ py: 2 }}>
                          Chưa có rule nào — nhấn "+ Thêm Rule" để bắt đầu
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rules.map((rule) => (
                      <TableRow
                        key={rule.rule_id}
                        sx={{ opacity: rule.is_enabled ? 1 : 0.5, '&:hover': { bgcolor: 'action.hover' } }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>{rule.priority}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{rule.name}</Typography>
                          {rule.description && (
                            <Typography variant="caption" color="text.disabled">{rule.description}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {rule.conditions.map((c, i) => (
                              <Chip key={i} label={conditionLabel(c)} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={rule.action}
                            size="small"
                            color={ACTION_COLORS[rule.action]}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={rule.is_enabled}
                            onChange={() => handleToggle(rule)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={() => { setEditing(rule); setDialogOpen(true) }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setConfirmDelete(rule.rule_id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <RuleDialog
        open={dialogOpen}
        editing={editing}
        onClose={() => setDialogOpen(false)}
        onSaved={() => { loadRules(); setSnack({ msg: editing ? 'Đã cập nhật rule' : 'Đã tạo rule mới', severity: 'success' }) }}
      />

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} maxWidth="xs">
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn chắc chắn muốn xóa rule này? Hành động không thể hoàn tác.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => confirmDelete && handleDelete(confirmDelete)}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack !== null}
        autoHideDuration={3500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack?.severity ?? 'info'} onClose={() => setSnack(null)} sx={{ width: '100%' }}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </>
  )
}
