/**
 * Settings/index.tsx — Trang cài đặt hệ thống.
 * Cấu hình ngưỡng rủi ro, thông báo và kết nối API.
 */
import { useState } from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Slider from '@mui/material/Slider'
import Alert from '@mui/material/Alert'

interface ThresholdSettings {
  fraudProbability:  number
  riskScoreHigh:     number
  riskScoreCritical: number
}

interface NotificationSettings {
  emailOnCritical:  boolean
  emailOnHigh:      boolean
  slackWebhook:     string
  alertCooldownMin: number
}

export function Settings() {
  const [thresholds, setThresholds] = useState<ThresholdSettings>({
    fraudProbability:  0.5,
    riskScoreHigh:     70,
    riskScoreCritical: 90,
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailOnCritical:  true,
    emailOnHigh:      false,
    slackWebhook:     '',
    alertCooldownMin: 5,
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // TODO: PUT /api/v1/settings
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'text.primary', mb: 0.5 }}>Cài đặt</Typography>
        <Typography variant="body2" color="text.secondary">
          Cấu hình ngưỡng phát hiện, thông báo và kết nối hệ thống
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Đã lưu cài đặt thành công.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Ngưỡng phát hiện */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}>
            <CardHeader
              title={<Typography variant="subtitle1" fontWeight={600}>Ngưỡng phát hiện</Typography>}
              subheader={<Typography variant="caption" color="text.secondary">Điều chỉnh độ nhạy của mô hình</Typography>}
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ngưỡng xác suất gian lận: <strong>{(thresholds.fraudProbability * 100).toFixed(0)}%</strong>
                </Typography>
                <Slider
                  value={thresholds.fraudProbability * 100}
                  onChange={(_e, v) =>
                    setThresholds((p) => ({ ...p, fraudProbability: (v as number) / 100 }))
                  }
                  min={10}
                  max={90}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v}%`}
                  color="error"
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ngưỡng rủi ro CAO: <strong>{thresholds.riskScoreHigh}</strong>
                </Typography>
                <Slider
                  value={thresholds.riskScoreHigh}
                  onChange={(_e, v) =>
                    setThresholds((p) => ({ ...p, riskScoreHigh: v as number }))
                  }
                  min={50}
                  max={85}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                  color="warning"
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ngưỡng rủi ro NGUY HIỂM: <strong>{thresholds.riskScoreCritical}</strong>
                </Typography>
                <Slider
                  value={thresholds.riskScoreCritical}
                  onChange={(_e, v) =>
                    setThresholds((p) => ({ ...p, riskScoreCritical: v as number }))
                  }
                  min={thresholds.riskScoreHigh + 5}
                  max={99}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  color="error"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Thông báo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}>
            <CardHeader
              title={<Typography variant="subtitle1" fontWeight={600}>Thông báo</Typography>}
              subheader={<Typography variant="caption" color="text.secondary">Kênh cảnh báo khi phát hiện gian lận</Typography>}
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailOnCritical}
                    onChange={(e) =>
                      setNotifications((p) => ({ ...p, emailOnCritical: e.target.checked }))
                    }
                    color="error"
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
                    checked={notifications.emailOnHigh}
                    onChange={(e) =>
                      setNotifications((p) => ({ ...p, emailOnHigh: e.target.checked }))
                    }
                    color="warning"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Email khi có cảnh báo CAO</Typography>
                    <Typography variant="caption" color="text.disabled">Theo batch mỗi 15 phút</Typography>
                  </Box>
                }
              />

              <TextField
                label="Slack Webhook URL"
                value={notifications.slackWebhook}
                onChange={(e) =>
                  setNotifications((p) => ({ ...p, slackWebhook: e.target.value }))
                }
                size="small"
                fullWidth
                placeholder="https://hooks.slack.com/services/..."
                type="url"
              />

              <TextField
                label="Cooldown giữa các cảnh báo (phút)"
                value={notifications.alertCooldownMin}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (!isNaN(v) && v >= 0) {
                    setNotifications((p) => ({ ...p, alertCooldownMin: v }))
                  }
                }}
                size="small"
                type="number"
                inputProps={{ min: 0, max: 60 }}
                fullWidth
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Nút lưu */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave} sx={{ px: 4, fontWeight: 600 }}>
          Lưu cài đặt
        </Button>
      </Box>
    </Box>
  )
}
