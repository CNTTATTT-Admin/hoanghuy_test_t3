/**
 * NotificationsSection.tsx — Section cấu hình kênh thông báo trong Settings.
 * Hỗ trợ: Email, Slack, Telegram, Custom Webhook, Alert Cooldown, Routing by Severity.
 */
import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import SendIcon from '@mui/icons-material/Send'
import { apiPost } from '../../services/apiClient'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface NotificationsSettings {
  email_on_critical:   boolean
  email_on_high:       boolean
  slack_webhook:       string
  telegram_bot_token:  string
  telegram_chat_id:    string
  custom_webhook_url:  string
  alert_cooldown_min:  number
  routing_by_severity: boolean
  routing_config:      Record<string, string[]>
}

interface Props {
  settings: NotificationsSettings
  onChange: (key: string, value: unknown) => void
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const
const CHANNELS   = ['email', 'slack', 'telegram', 'webhook'] as const

const SEVERITY_COLORS: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
  CRITICAL: 'error',
  HIGH:     'warning',
  MEDIUM:   'info',
  LOW:      'default',
}

type TestChannel = 'slack' | 'telegram' | 'webhook'
type TestState   = 'idle' | 'loading' | 'success' | 'error'

// ── Sub-component: Section label ───────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="caption" color="text.disabled" fontWeight={700} letterSpacing={0.8} sx={{ textTransform: 'uppercase', mt: 1 }}>
      {children}
    </Typography>
  )
}

// ── Sub-component: Test button ────────────────────────────────────────────────
function TestButton({ channel, onTest }: { channel: TestChannel; onTest: (ch: TestChannel) => void }) {
  return (
    <Tooltip title={`Gửi test qua ${channel}`}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<SendIcon fontSize="small" />}
        onClick={() => onTest(channel)}
        sx={{ minWidth: 70, py: 0.5 }}
      >
        Test
      </Button>
    </Tooltip>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function NotificationsSection({ settings, onChange }: Props) {
  const [testStates, setTestStates] = useState<Record<TestChannel, TestState>>({
    slack: 'idle', telegram: 'idle', webhook: 'idle',
  })
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null)

  // ── Test notification ───────────────────────────────────────────────────
  const handleTest = async (channel: TestChannel) => {
    setTestStates((prev) => ({ ...prev, [channel]: 'loading' }))
    try {
      const res = await apiPost<{ success: boolean; detail: string }>(
        '/api/v1/settings/test-notification',
        { channel },
      )
      setTestStates((prev) => ({ ...prev, [channel]: res.success ? 'success' : 'error' }))
      setSnack({ msg: res.detail, severity: res.success ? 'success' : 'error' })
    } catch (e: unknown) {
      setTestStates((prev) => ({ ...prev, [channel]: 'error' }))
      setSnack({ msg: e instanceof Error ? e.message : 'Test thất bại', severity: 'error' })
    } finally {
      // Reset icon sau 4s
      setTimeout(() => setTestStates((prev) => ({ ...prev, [channel]: 'idle' })), 4000)
    }
  }

  function TestIcon({ channel }: { channel: TestChannel }) {
    if (testStates[channel] === 'loading') return <CircularProgress size={16} />
    if (testStates[channel] === 'success') return <CheckCircleOutlineIcon fontSize="small" color="success" />
    if (testStates[channel] === 'error')   return <ErrorOutlineIcon fontSize="small" color="error" />
    return null
  }

  // ── Routing config helpers ──────────────────────────────────────────────
  const routingConfig: Record<string, string[]> = settings.routing_config ?? {
    CRITICAL: ['email', 'slack', 'telegram', 'webhook'],
    HIGH:     ['email', 'slack'],
    MEDIUM:   ['slack'],
    LOW:      ['console'],
  }

  const toggleRouting = (severity: string, channel: string) => {
    const current = routingConfig[severity] ?? []
    const updated  = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel]
    onChange('routing_config', { ...routingConfig, [severity]: updated })
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Card variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}>
      <CardHeader
        title={<Typography variant="subtitle1" fontWeight={600}>📡 Thông báo & Kênh cảnh báo</Typography>}
        subheader={<Typography variant="caption" color="text.secondary">Cấu hình kênh nhận cảnh báo gian lận theo mức độ</Typography>}
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        {/* ── Email ── */}
        <Box>
          <SectionLabel>Kênh Email</SectionLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email_on_critical}
                  onChange={(e) => onChange('email_on_critical', e.target.checked)}
                  color="error"
                  size="small"
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Email khi có cảnh báo NGUY HIỂM</Typography>
                  <Typography variant="caption" color="text.disabled">Gửi ngay lập tức</Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email_on_high}
                  onChange={(e) => onChange('email_on_high', e.target.checked)}
                  color="warning"
                  size="small"
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Email khi có cảnh báo CAO</Typography>
                  <Typography variant="caption" color="text.disabled">Batch mỗi 15 phút</Typography>
                </Box>
              }
            />
          </Box>
        </Box>

        <Divider />

        {/* ── Slack ── */}
        <Box>
          <SectionLabel>Kênh Slack</SectionLabel>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 1 }}>
            <TextField
              label="Slack Webhook URL"
              value={settings.slack_webhook}
              onChange={(e) => onChange('slack_webhook', e.target.value)}
              size="small"
              fullWidth
              placeholder="https://hooks.slack.com/services/..."
              type="url"
              InputProps={{
                endAdornment: testStates.slack !== 'idle'
                  ? <InputAdornment position="end"><TestIcon channel="slack" /></InputAdornment>
                  : undefined,
              }}
            />
            <TestButton channel="slack" onTest={handleTest} />
          </Box>
        </Box>

        <Divider />

        {/* ── Telegram ── */}
        <Box>
          <SectionLabel>Kênh Telegram (mới)</SectionLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            <TextField
              label="Bot Token"
              value={settings.telegram_bot_token}
              onChange={(e) => onChange('telegram_bot_token', e.target.value)}
              size="small"
              fullWidth
              placeholder="123456:ABC-DEF..."
              type="password"
              autoComplete="new-password"
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                label="Chat ID"
                value={settings.telegram_chat_id}
                onChange={(e) => onChange('telegram_chat_id', e.target.value)}
                size="small"
                fullWidth
                placeholder="-100123456789"
                InputProps={{
                  endAdornment: testStates.telegram !== 'idle'
                    ? <InputAdornment position="end"><TestIcon channel="telegram" /></InputAdornment>
                    : undefined,
                }}
              />
              <TestButton channel="telegram" onTest={handleTest} />
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* ── Custom Webhook ── */}
        <Box>
          <SectionLabel>Webhook tùy chỉnh (mới)</SectionLabel>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 1 }}>
            <TextField
              label="Webhook URL"
              value={settings.custom_webhook_url}
              onChange={(e) => onChange('custom_webhook_url', e.target.value)}
              size="small"
              fullWidth
              placeholder="https://my-system.com/webhook"
              type="url"
              InputProps={{
                endAdornment: testStates.webhook !== 'idle'
                  ? <InputAdornment position="end"><TestIcon channel="webhook" /></InputAdornment>
                  : undefined,
              }}
            />
            <TestButton channel="webhook" onTest={handleTest} />
          </Box>
        </Box>

        <Divider />

        {/* ── Cài đặt chung ── */}
        <Box>
          <SectionLabel>Cài đặt chung</SectionLabel>
          <Box sx={{ mt: 1, maxWidth: 280 }}>
            <TextField
              label="Cooldown giữa các cảnh báo (phút)"
              value={settings.alert_cooldown_min}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v) && v >= 0 && v <= 60) onChange('alert_cooldown_min', v)
              }}
              size="small"
              type="number"
              inputProps={{ min: 0, max: 60 }}
              fullWidth
              helperText="Tránh spam — 0 = không giới hạn"
            />
          </Box>
        </Box>

        <Divider />

        {/* ── Routing by Severity ── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SectionLabel>Routing theo mức độ (mới)</SectionLabel>
            <Switch
              checked={settings.routing_by_severity}
              onChange={(e) => onChange('routing_by_severity', e.target.checked)}
              size="small"
              color="primary"
            />
            <Typography variant="caption" color={settings.routing_by_severity ? 'primary' : 'text.disabled'}>
              {settings.routing_by_severity ? 'Bật' : 'Tắt'}
            </Typography>
          </Box>

          {settings.routing_by_severity && (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 360 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Mức độ</TableCell>
                    {CHANNELS.map((ch) => (
                      <TableCell key={ch} align="center">
                        <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                          {ch}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {SEVERITIES.map((sev) => {
                    const active = routingConfig[sev] ?? []
                    return (
                      <TableRow key={sev}>
                        <TableCell>
                          <Chip label={sev} size="small" color={SEVERITY_COLORS[sev]} />
                        </TableCell>
                        {CHANNELS.map((ch) => (
                          <TableCell key={ch} align="center" padding="checkbox">
                            <Checkbox
                              checked={active.includes(ch)}
                              onChange={() => toggleRouting(sev, ch)}
                              size="small"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                Chọn kênh nhận cảnh báo theo từng mức độ nghiêm trọng
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      {/* Snackbar for test results */}
      <Snackbar
        open={snack !== null}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack?.severity ?? 'info'} onClose={() => setSnack(null)} sx={{ width: '100%' }}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Card>
  )
}
