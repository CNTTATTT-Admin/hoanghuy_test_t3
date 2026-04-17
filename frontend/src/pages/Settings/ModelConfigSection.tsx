/**
 * ModelConfigSection.tsx — Section cấu hình Model & AI trong trang Settings.
 * Hiển thị thông tin model đang chạy và cho phép chỉnh confidence threshold,
 * calibration method, và feature engineering flag.
 */
import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Slider from '@mui/material/Slider'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { apiGet } from '../../services/apiClient'

interface ModelInfo {
  model_type: string
  model_file: string | null
  metadata: Record<string, string>
  config: Record<string, unknown>
}

export interface ModelSettings {
  current_model: string
  model_version: string
  feature_engineering: boolean
  confidence_threshold: number
  calibration_method: string
}

interface Props {
  settings: ModelSettings
  onChange: (key: string, value: unknown) => void
}

function getSliderColor(val: number): 'error' | 'warning' | 'success' {
  if (val > 0.7) return 'error'
  if (val >= 0.4) return 'warning'
  return 'success'
}

export function ModelConfigSection({ settings, onChange }: Props) {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<ModelInfo>('/api/v1/settings/model/info')
      .then(setModelInfo)
      .catch(() => setModelInfo(null))
      .finally(() => setLoading(false))
  }, [])

  // Coerce API values — JSONB columns có thể trả về string thay vì đúng kiểu
  const threshold        = Math.max(0.05, Math.min(0.95, Number(settings.confidence_threshold) || 0.35))
  const featureEngBool   = settings.feature_engineering === true || String(settings.feature_engineering) === 'true'
  const calibrationValue = settings.calibration_method ?? 'isotonic'

  const thresholdPct = Math.round(threshold * 100)

  return (
    <Card variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}>
      <CardHeader
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            🧠 Model & AI Configuration
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            Cấu hình mô hình phát hiện gian lận
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* ── Model Info Panel ── */}
        <Box>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Thông tin model hiện tại
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">Đang tải...</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'action.hover',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
                  Loại model:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {modelInfo?.model_type ?? 'LightGBM (LGBMClassifier)'}
                </Typography>
                <Chip label="Active" color="success" size="small" />
              </Box>

              {modelInfo?.model_file && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
                    File:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {modelInfo.model_file}
                  </Typography>
                </Box>
              )}

              {modelInfo?.metadata && Object.keys(modelInfo.metadata).length > 0 && (
                <>
                  {modelInfo.metadata['saved_at'] && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
                        Ngày train:
                      </Typography>
                      <Typography variant="body2">
                        {modelInfo.metadata['saved_at']}
                      </Typography>
                    </Box>
                  )}
                  {modelInfo.metadata['threshold'] && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
                        Threshold:
                      </Typography>
                      <Typography variant="body2">
                        {modelInfo.metadata['threshold']}
                      </Typography>
                    </Box>
                  )}
                  {modelInfo.metadata['n_features'] && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
                        Số features:
                      </Typography>
                      <Typography variant="body2">
                        {modelInfo.metadata['n_features']}
                      </Typography>
                    </Box>
                  )}
                  {modelInfo.metadata['calibration_method'] && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
                        Calibration:
                      </Typography>
                      <Typography variant="body2">
                        {modelInfo.metadata['calibration_method']}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </Box>

        <Divider />

        {/* ── Confidence Threshold Slider ── */}
        <Box>
          <Tooltip
            title="Ngưỡng xác suất tối thiểu để xác định giao dịch là gian lận. Giá trị thấp → nhạy hơn nhưng có thể tăng false positive."
            placement="top-start"
          >
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ cursor: 'help' }}>
              Confidence Threshold:{' '}
              <strong style={{ color: threshold > 0.7 ? '#f44336' : threshold >= 0.4 ? '#ff9800' : '#4caf50' }}>
                {thresholdPct}%
              </strong>
            </Typography>
          </Tooltip>
          <Slider
            value={thresholdPct}
            onChange={(_e, v) => onChange('confidence_threshold', (v as number) / 100)}
            min={5}
            max={95}
            step={5}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v}%`}
            color={getSliderColor(threshold)}
          />
          <Typography variant="caption" color="text.disabled">
            Thay đổi có hiệu lực ngay (qua Redis cache). Mặc định: 35%
          </Typography>
        </Box>

        <Divider />

        {/* ── Calibration Method ── */}
        <Box>
          <FormControl>
            <FormLabel sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Phương pháp Calibration
              </Typography>
            </FormLabel>
            <Tooltip title="Thay đổi calibration chỉ có hiệu lực sau khi retrain model." placement="top-start">
              <Typography variant="caption" color="text.disabled" sx={{ mb: 1, display: 'block', cursor: 'help' }}>
                ⚠ Ảnh hưởng sau lần retrain tiếp theo
              </Typography>
            </Tooltip>
            <RadioGroup
              value={calibrationValue}
              onChange={(e) => onChange('calibration_method', e.target.value)}
            >
              <FormControlLabel
                value="isotonic"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2">Isotonic Regression</Typography>
                    <Typography variant="caption" color="text.disabled">
                      Monotonic calibration — phù hợp với dữ liệu lớn
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="platt"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2">Platt Scaling</Typography>
                    <Typography variant="caption" color="text.disabled">
                      Sigmoid calibration — phù hợp với dữ liệu nhỏ
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="none"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2">Không dùng Calibration</Typography>
                    <Typography variant="caption" color="text.disabled">
                      Dùng xác suất thô từ model
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider />

        {/* ── Feature Engineering Toggle ── */}
        <FormControlLabel
          control={
            <Switch
              checked={featureEngBool}
              onChange={(e) => onChange('feature_engineering', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body2">Feature Engineering</Typography>
              <Typography variant="caption" color="text.disabled">
                Tắt để giảm latency, nhưng giảm độ chính xác. Hiệu lực sau retrain.
              </Typography>
            </Box>
          }
        />
      </CardContent>
    </Card>
  )
}
