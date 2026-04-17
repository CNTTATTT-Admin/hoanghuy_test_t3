/**
 * Settings/index.tsx — Trang cài đặt hệ thống.
 * Cấu hình mô hình AI, ngưỡng rủi ro, thông báo.
 * Load từ GET /api/v1/settings, lưu qua PUT /api/v1/settings/bulk.
 */
import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { apiGet, apiPut } from '../../services/apiClient'
import { ModelConfigSection } from './ModelConfigSection'
import { RiskThresholdsSection } from './RiskThresholdsSection'
import { RuleEngineSection } from './RuleEngineSection'
import { NotificationsSection } from './NotificationsSection'
import { SystemSecuritySection } from './SystemSecuritySection'
import type { RiskSettings } from './RiskThresholdsSection'
import type { NotificationsSettings } from './NotificationsSection'
import type { SystemSecuritySettings } from './SystemSecuritySection'

// ── State types ──────────────────────────────────────────────────────────────
interface ModelSettings {
  current_model:          string
  model_version:          string
  feature_engineering:    boolean
  confidence_threshold:   number
  calibration_method:     string
}

interface AllSettingsResponse {
  data: Record<string, Record<string, unknown>>
}

// ── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_MODEL: ModelSettings = {
  current_model:        'lightgbm',
  model_version:        'v1',
  feature_engineering:  true,
  confidence_threshold: 0.35,
  calibration_method:   'isotonic',
}

const DEFAULT_RISK: RiskSettings = {
  fraud_probability_threshold: 0.5,
  risk_score_high:             70,
  risk_score_critical:         90,
}

const DEFAULT_NOTIFICATIONS: NotificationsSettings = {
  email_on_critical:   true,
  email_on_high:       false,
  slack_webhook:       '',
  telegram_bot_token:  '',
  telegram_chat_id:    '',
  custom_webhook_url:  '',
  alert_cooldown_min:  5,
  routing_by_severity: false,
  routing_config: {
    CRITICAL: ['email', 'slack', 'telegram', 'webhook'],
    HIGH:     ['email', 'slack'],
    MEDIUM:   ['slack'],
    LOW:      ['console'],
  },
}

const DEFAULT_SYSTEM: SystemSecuritySettings = {
  rate_limit_per_minute: 10,
  session_timeout_min:   30,
  ip_whitelist:          [],
  audit_log_enabled:     true,
  log_retention_days:    30,
  test_mode:             false,
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Settings() {
  const [modelSettings, setModelSettings]   = useState<ModelSettings>(DEFAULT_MODEL)
  const [riskSettings, setRiskSettings]     = useState<RiskSettings>(DEFAULT_RISK)
  const [notifications, setNotifications]   = useState<NotificationsSettings>(DEFAULT_NOTIFICATIONS)
  const [systemSettings, setSystemSettings] = useState<SystemSecuritySettings>(DEFAULT_SYSTEM)
  const [loading, setLoading]               = useState(true)
  const [saveStatus, setSaveStatus]         = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  // ── Load settings from backend ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    apiGet<AllSettingsResponse>('/api/v1/settings')
      .then((res) => {
        if (cancelled) return
        const d = res.data ?? {}
        if (d.model) {
          setModelSettings((prev) => ({ ...prev, ...(d.model as Partial<ModelSettings>) }))
        }
        if (d.risk) {
          setRiskSettings((prev) => ({ ...prev, ...(d.risk as Partial<RiskSettings>) }))
        }
        if (d.notifications) {
          setNotifications((prev) => ({ ...prev, ...(d.notifications as Partial<NotificationsSettings>) }))
        }
        if (d.system) {
          setSystemSettings((prev) => ({ ...prev, ...(d.system as Partial<SystemSecuritySettings>) }))
        }
      })
      .catch(() => {/* fallback to defaults */})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // ── Bulk save ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      await apiPut('/api/v1/settings/bulk', {
        updates: [
          { namespace: 'model',         settings: modelSettings },
          { namespace: 'risk',          settings: riskSettings },
          { namespace: 'notifications', settings: notifications },
          { namespace: 'system',        settings: systemSettings },
        ],
      })
      setSaveStatus('success')
    } catch {
      setSaveStatus('error')
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  const handleModelChange = (key: string, value: unknown) =>
    setModelSettings((prev) => ({ ...prev, [key]: value }))

  const handleRiskChange = (key: string, value: number) =>
    setRiskSettings((prev) => ({ ...prev, [key]: value }))

  const handleNotificationsChange = (key: string, value: unknown) =>
    setNotifications((prev) => ({ ...prev, [key]: value }))

  const handleSystemChange = (key: string, value: unknown) =>
    setSystemSettings((prev) => ({ ...prev, [key]: value }))

  const handleCleanupLogs = () => {
    // Callback sau cleanup — có thể refresh thống kê nếu cần
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'text.primary', mb: 0.5 }}>Cài đặt</Typography>
        <Typography variant="body2" color="text.secondary">
          Cấu hình mô hình AI, ngưỡng phát hiện và thông báo hệ thống
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Model & AI Config — full width */}
        <Grid size={{ xs: 12 }}>
          <ModelConfigSection settings={modelSettings} onChange={handleModelChange} />
        </Grid>

        {/* Risk Thresholds */}
        <Grid size={{ xs: 12, md: 6 }}>
          <RiskThresholdsSection settings={riskSettings} onChange={handleRiskChange} />
        </Grid>

        {/* Notifications — upgraded */}
        <Grid size={{ xs: 12, md: 6 }}>
          <NotificationsSection settings={notifications} onChange={handleNotificationsChange} />
        </Grid>
      </Grid>

      {/* Rule Engine — full width */}
      <Box sx={{ mt: 3 }}>
        <RuleEngineSection />
      </Box>

      {/* System & Security — full width */}
      <Box sx={{ mt: 3 }}>
        <SystemSecuritySection
          settings={systemSettings}
          onChange={handleSystemChange}
          onCleanupLogs={handleCleanupLogs}
        />
      </Box>

      {/* Nút lưu */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          sx={{ px: 4, fontWeight: 600 }}
        >
          {saveStatus === 'saving' ? 'Đang lưu...' : 'Lưu cài đặt'}
        </Button>
      </Box>

      {/* Snackbar feedback */}
      <Snackbar
        open={saveStatus === 'success' || saveStatus === 'error'}
        autoHideDuration={4000}
        onClose={() => setSaveStatus('idle')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={saveStatus === 'success' ? 'success' : 'error'}
          onClose={() => setSaveStatus('idle')}
          sx={{ width: '100%' }}
        >
          {saveStatus === 'success' ? 'Đã lưu cài đặt thành công.' : 'Lưu cài đặt thất bại. Vui lòng thử lại.'}
        </Alert>
      </Snackbar>
    </Box>
  )
}
