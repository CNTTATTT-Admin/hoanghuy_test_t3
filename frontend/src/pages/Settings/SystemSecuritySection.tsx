/**
 * SystemSecuritySection.tsx — Cài đặt hệ thống & bảo mật.
 * Rate Limit, Session Timeout, IP Whitelist, Audit Log, Test Mode.
 */
import { useState, useEffect } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Snackbar from '@mui/material/Snackbar'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'
import { apiPost } from '../../services/apiClient'

export interface SystemSecuritySettings {
  rate_limit_per_minute: number
  session_timeout_min:   number
  ip_whitelist:          string[]
  audit_log_enabled:     boolean
  log_retention_days:    number
  test_mode:             boolean
}

interface SystemSecuritySectionProps {
  settings:       SystemSecuritySettings
  onChange:       (key: string, value: unknown) => void
  onCleanupLogs:  () => void
}

interface CleanupResult {
  retention_days: number
  cutoff_date:    string
  deleted: {
    inference_history: number
    user_audit_log:    number
    token_blacklist:   number
  }
}

export function SystemSecuritySection({
  settings,
  onChange,
  onCleanupLogs,
}: SystemSecuritySectionProps) {
  // Coerce giá trị từ API về đúng kiểu (API có thể trả về string thay vì boolean/number)
  const rateLimitValue    = Math.max(1, Math.min(100, Number(settings.rate_limit_per_minute) || 10))
  const sessionTimeout    = [15, 30, 60, 120, 480].includes(Number(settings.session_timeout_min))
    ? Number(settings.session_timeout_min)
    : 30
  const auditLogEnabled   = settings.audit_log_enabled === true || String(settings.audit_log_enabled) === 'true'
  const testModeEnabled   = settings.test_mode === true || String(settings.test_mode) === 'true'
  const logRetentionDays  = [7, 30, 90, 180, 365].includes(Number(settings.log_retention_days))
    ? Number(settings.log_retention_days)
    : 30
  const ipWhitelist: string[] = Array.isArray(settings.ip_whitelist) ? settings.ip_whitelist : []

  const [newIp, setNewIp]                       = useState('')
  const [ipEnabled, setIpEnabled]               = useState(ipWhitelist.length > 0)
  const [confirmTestMode, setConfirmTestMode]   = useState(false)
  const [confirmCleanup, setConfirmCleanup]     = useState(false)
  const [cleaning, setCleaning]                 = useState(false)
  const [cleanupResult, setCleanupResult]       = useState<CleanupResult | null>(null)
  const [snackOpen, setSnackOpen]               = useState(false)
  const [snackMsg, setSnackMsg]                 = useState('')
  const [snackSeverity, setSnackSeverity]       = useState<'success' | 'error'>('success')

  // Sync ipEnabled khi whitelist được load từ API
  useEffect(() => {
    if (ipWhitelist.length > 0) setIpEnabled(true)
  }, [ipWhitelist.length])

  const rateLimitColor =
    rateLimitValue <= 20 ? 'success' :
    rateLimitValue <= 50 ? 'warning' : 'error'

  const rateLimitLabel =
    rateLimitValue <= 20 ? '✅ Bảo mật cao' :
    rateLimitValue <= 50 ? '⚠ Trung bình' : '🔴 Nguy cơ cao'

  // ── IP helpers ────────────────────────────────────────────────────────────
  const validateIp = (ip: string): boolean => {
    const re = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$|^[0-9a-fA-F:]+(?:\/\d{1,3})?$/
    return re.test(ip.trim())
  }

  const handleAddIp = () => {
    const trimmed = newIp.trim()
    if (!trimmed) return
    if (!validateIp(trimmed)) {
      setSnackMsg('IP không hợp lệ. Ví dụ: 192.168.1.0/24 hoặc 10.0.0.1')
      setSnackSeverity('error')
      setSnackOpen(true)
      return
    }
    if (ipWhitelist.includes(trimmed)) {
      setSnackMsg('IP này đã có trong danh sách')
      setSnackSeverity('error')
      setSnackOpen(true)
      return
    }
    onChange('ip_whitelist', [...ipWhitelist, trimmed])
    setNewIp('')
  }

  const handleRemoveIp = (ip: string) => {
    onChange('ip_whitelist', ipWhitelist.filter((x) => x !== ip))
  }

  // ── Test mode ─────────────────────────────────────────────────────────────
  const handleTestModeToggle = () => {
    if (!testModeEnabled) {
      setConfirmTestMode(true)
    } else {
      onChange('test_mode', false)
    }
  }

  const handleConfirmTestMode = () => {
    onChange('test_mode', true)
    setConfirmTestMode(false)
  }

  // ── Cleanup logs ──────────────────────────────────────────────────────────
  const handleCleanup = async () => {
    setCleaning(true)
    setConfirmCleanup(false)
    try {
      const result = await apiPost<CleanupResult>('/api/v1/settings/system/cleanup-logs', {})
      setCleanupResult(result)
      onCleanupLogs()
      setSnackMsg('Đã xóa log cũ thành công')
      setSnackSeverity('success')
    } catch {
      setSnackMsg('Không thể xóa log. Vui lòng thử lại.')
      setSnackSeverity('error')
    } finally {
      setCleaning(false)
      setSnackOpen(true)
    }
  }

  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            🛡 Hệ thống &amp; Bảo mật
          </Typography>
        }
      />
      <CardContent>
        {/* Test Mode warning banner */}
        {testModeEnabled && (
          <Alert severity="warning" sx={{ mb: 3, fontWeight: 600 }}>
            ⚠ HỆ THỐNG ĐANG Ở CHẾ ĐỘ THỬ NGHIỆM — Giao dịch gian lận sẽ KHÔNG bị chặn thực sự.
          </Alert>
        )}

        {/* ── Rate Limiting ── */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Rate Limiting
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Giới hạn API requests / phút cho mỗi tài khoản nguồn:
        </Typography>
        <Box sx={{ px: 1, mb: 0.5 }}>
          <Slider
            value={rateLimitValue}
            min={1}
            max={100}
            step={5}
            color={rateLimitColor as 'success' | 'warning' | 'error'}
            onChange={(_, v) => onChange('rate_limit_per_minute', v as number)}
            valueLabelDisplay="on"
            valueLabelFormat={(v) => `${v} req/min`}
            sx={{ mt: 3 }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {rateLimitLabel}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* ── Session Timeout ── */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Session &amp; Authentication
        </Typography>
        <FormControl size="small" sx={{ minWidth: 240, mb: 0.5 }}>
          <InputLabel>Thời gian session hết hạn</InputLabel>
          <Select
            value={sessionTimeout}
            label="Thời gian session hết hạn"
            onChange={(e) => onChange('session_timeout_min', Number(e.target.value))}
          >
            {[15, 30, 60, 120, 480].map((v) => (
              <MenuItem key={v} value={v}>
                {v < 60 ? `${v} phút` : `${v / 60} giờ`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          Ảnh hưởng đến token mới. Token đang hoạt động giữ nguyên TTL cũ.
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* ── IP Whitelist ── */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          IP Whitelist
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={ipEnabled}
              onChange={(e) => {
                setIpEnabled(e.target.checked)
                if (!e.target.checked) onChange('ip_whitelist', [])
              }}
            />
          }
          label="Bật IP Whitelist (chỉ cho phép IP trong danh sách)"
        />
        {ipEnabled && (
          <Box sx={{ mt: 1, ml: 1 }}>
            <Alert severity="warning" sx={{ mb: 1 }}>
              ⚠ Cẩn thận! IP sai có thể khóa bạn khỏi hệ thống. Nên luôn giữ 127.0.0.1 trong danh sách.
            </Alert>
            <List
              dense
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1, maxHeight: 200, overflowY: 'auto' }}
            >
              {ipWhitelist.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="Danh sách trống — mọi IP đều bị từ chối"
                    primaryTypographyProps={{ color: 'error' }}
                  />
                </ListItem>
              ) : (
                ipWhitelist.map((ip) => (
                  <ListItem
                    key={ip}
                    secondaryAction={
                      <IconButton size="small" onClick={() => handleRemoveIp(ip)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={ip} />
                  </ListItem>
                ))
              )}
            </List>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                label="Thêm IP (vd: 192.168.1.0/24)"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddIp() }}
                sx={{ flex: 1 }}
              />
              <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddIp}>
                Thêm
              </Button>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ── Audit & Logging ── */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Audit &amp; Logging
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={auditLogEnabled}
              onChange={(e) => onChange('audit_log_enabled', e.target.checked)}
            />
          }
          label="Bật Audit Log (ghi nhật ký hành vi người dùng)"
          sx={{ mb: 1, display: 'block' }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Thời gian lưu log</InputLabel>
            <Select
              value={logRetentionDays}
              label="Thời gian lưu log"
              onChange={(e) => onChange('log_retention_days', Number(e.target.value))}
            >
              {[7, 30, 90, 180, 365].map((v) => (
                <MenuItem key={v} value={v}>{v} ngày</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title={`Xóa log cũ hơn ${logRetentionDays} ngày`}>
            <span>
              <Button
                variant="outlined"
                color="warning"
                startIcon={cleaning ? <CircularProgress size={16} /> : <CleaningServicesIcon />}
                disabled={cleaning}
                onClick={() => setConfirmCleanup(true)}
              >
                Dọn dẹp log cũ
              </Button>
            </span>
          </Tooltip>
        </Box>
        {cleanupResult && (
          <Alert severity="success" sx={{ mt: 1 }}>
            Đã xóa: <strong>{cleanupResult.deleted.inference_history}</strong> inference,{' '}
            <strong>{cleanupResult.deleted.user_audit_log}</strong> audit,{' '}
            <strong>{cleanupResult.deleted.token_blacklist}</strong> token blacklist
            {' '}(cutoff: {new Date(cleanupResult.cutoff_date).toLocaleDateString('vi-VN')})
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ── Test Mode ── */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          ⚠ Chế độ thử nghiệm
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={testModeEnabled}
              onChange={handleTestModeToggle}
              color="warning"
            />
          }
          label="Bật chế độ simulation"
        />
        <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mt: 0.5 }}>
          Khi bật: hệ thống phân tích nhưng KHÔNG chặn giao dịch. Thích hợp cho staging hoặc demo.
        </Typography>

        {/* ── Dialogs ── */}
        <Dialog open={confirmTestMode} onClose={() => setConfirmTestMode(false)} maxWidth="xs">
          <DialogTitle>⚠ Bật Test Mode?</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc muốn bật Test Mode? Giao dịch gian lận sẽ{' '}
              <strong>KHÔNG bị chặn thực sự</strong>. Chỉ sử dụng cho môi trường staging hoặc demo.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmTestMode(false)}>Hủy</Button>
            <Button onClick={handleConfirmTestMode} color="warning" variant="contained">
              Bật Test Mode
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={confirmCleanup} onClose={() => setConfirmCleanup(false)} maxWidth="xs">
          <DialogTitle>Xác nhận dọn dẹp log</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn sắp xóa tất cả log cũ hơn{' '}
              <strong>{logRetentionDays} ngày</strong>.{' '}
              Hành động này không thể hoàn tác. Tiếp tục?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmCleanup(false)}>Hủy</Button>
            <Button onClick={handleCleanup} color="warning" variant="contained">
              Xóa log cũ
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackOpen}
          autoHideDuration={4000}
          onClose={() => setSnackOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackSeverity} onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>
            {snackMsg}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  )
}
