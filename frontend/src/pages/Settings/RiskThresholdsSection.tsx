/**
 * RiskThresholdsSection.tsx — Section cấu hình ngưỡng rủi ro trong trang Settings.
 * Bao gồm 3 slider, risk band visualization và preview panel (3 giao dịch mẫu).
 */
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'

export interface RiskSettings {
  fraud_probability_threshold: number
  risk_score_high: number
  risk_score_critical: number
}

interface Props {
  settings: RiskSettings
  onChange: (key: string, value: number) => void
}

// ── Phân loại risk level ────────────────────────────────────────────────────
function classifyRisk(score: number, high: number, critical: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= critical) return 'CRITICAL'
  if (score >= high) return 'HIGH'
  if (score >= high * 0.6) return 'MEDIUM'
  return 'LOW'
}

function classifyDecision(prob: number, threshold: number): 'ALLOW' | 'REVIEW' | 'BLOCK' {
  if (prob >= 0.90) return 'BLOCK'
  if (prob >= threshold) return 'REVIEW'
  return 'ALLOW'
}

const RISK_CHIP_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'error',
  CRITICAL: 'error',
}

const DECISION_CHIP_COLORS: Record<string, 'success' | 'warning' | 'error'> = {
  ALLOW: 'success',
  REVIEW: 'warning',
  BLOCK: 'error',
}

const SAMPLE_TRANSACTIONS = [
  { label: 'Chuyển khoản $500',    riskScore: 45, fraudProb: 0.12 },
  { label: 'Rút tiền ATM $5,000',  riskScore: 78, fraudProb: 0.65 },
  { label: 'Giao dịch bất thường', riskScore: 95, fraudProb: 0.92 },
]

// ── Risk Band Visualization ──────────────────────────────────────────────────
function RiskBandBar({ high, critical }: { high: number; critical: number }) {
  const lowWidth     = high * 0.6              // LOW zone ends at 60% of high
  const mediumWidth  = high - lowWidth         // MEDIUM zone
  const highWidth    = critical - high         // HIGH zone
  const criticalWidth = 100 - critical         // CRITICAL zone

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
        Phân vùng rủi ro (0 → 100)
      </Typography>
      <Box sx={{ display: 'flex', height: 20, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ width: `${lowWidth}%`, bgcolor: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>LOW</Typography>
        </Box>
        <Box sx={{ width: `${mediumWidth}%`, bgcolor: '#ff9800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>MED</Typography>
        </Box>
        <Box sx={{ width: `${highWidth}%`, bgcolor: '#f57c00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>HIGH</Typography>
        </Box>
        <Box sx={{ width: `${criticalWidth}%`, bgcolor: '#f44336', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>CRIT</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" color="text.disabled">0</Typography>
        <Typography variant="caption" color="text.disabled">{Math.round(high * 0.6)}</Typography>
        <Typography variant="caption" color="text.disabled">{high}</Typography>
        <Typography variant="caption" color="text.disabled">{critical}</Typography>
        <Typography variant="caption" color="text.disabled">100</Typography>
      </Box>
    </Box>
  )
}

export function RiskThresholdsSection({ settings, onChange }: Props) {
  // Coerce API values — JSONB columns có thể trả về string, dẫn đến string concat thay vì số học
  const fraudProbThreshold = Math.max(0.1, Math.min(0.95, Number(settings.fraud_probability_threshold) || 0.5))
  const riskScoreHigh      = Math.max(30,  Math.min(85,   Number(settings.risk_score_high)             || 70))
  const riskScoreCritical  = Math.max(riskScoreHigh + 5, Math.min(99, Number(settings.risk_score_critical) || 90))

  return (
    <Card variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}>
      <CardHeader
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            ⚙️ Ngưỡng rủi ro
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            Điều chỉnh độ nhạy phát hiện và phân loại mức độ rủi ro
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* ── Fraud Probability Threshold ── */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Ngưỡng xác suất gian lận:{' '}
            <strong>{(fraudProbThreshold * 100).toFixed(0)}%</strong>
          </Typography>
          <Slider
            value={fraudProbThreshold * 100}
            onChange={(_e, v) => onChange('fraud_probability_threshold', (v as number) / 100)}
            min={10}
            max={95}
            step={5}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v}%`}
            color="error"
          />
          <Typography variant="caption" color="text.disabled">
            Giao dịch có xác suất ≥ ngưỡng này sẽ bị đánh dấu gian lận
          </Typography>
        </Box>

        {/* ── Risk Score High ── */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Ngưỡng rủi ro CAO:{' '}
            <strong>{riskScoreHigh}</strong>
          </Typography>
          <Slider
            value={riskScoreHigh}
            onChange={(_e, v) => {
              const newHigh = v as number
              onChange('risk_score_high', newHigh)
              // Đảm bảo critical >= high + 5
              if (riskScoreCritical <= newHigh + 4) {
                onChange('risk_score_critical', newHigh + 5)
              }
            }}
            min={30}
            max={85}
            step={5}
            marks
            valueLabelDisplay="auto"
            color="warning"
          />
        </Box>

        {/* ── Risk Score Critical ── */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Ngưỡng rủi ro NGUY HIỂM:{' '}
            <strong>{riskScoreCritical}</strong>
          </Typography>
          <Slider
            value={riskScoreCritical}
            onChange={(_e, v) => onChange('risk_score_critical', v as number)}
            min={riskScoreHigh + 5}
            max={99}
            step={1}
            marks
            valueLabelDisplay="auto"
            color="error"
          />
          <Typography variant="caption" color="text.disabled">
            Phải lớn hơn ngưỡng CAO ít nhất 5 điểm
          </Typography>
        </Box>

        <Divider />

        {/* ── Risk Band Visualization ── */}
        <RiskBandBar high={riskScoreHigh} critical={riskScoreCritical} />

        <Divider />

        {/* ── Preview Panel ── */}
        <Box>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Preview phân loại (dựa trên ngưỡng hiện tại)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {SAMPLE_TRANSACTIONS.map((tx) => {
              const risk     = classifyRisk(tx.riskScore, riskScoreHigh, riskScoreCritical)
              const decision = classifyDecision(tx.fraudProb, fraudProbThreshold)
              return (
                <Box
                  key={tx.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Box>
                    <Typography variant="body2">{tx.label}</Typography>
                    <Typography variant="caption" color="text.disabled">
                      Risk score: {tx.riskScore} · Fraud prob: {(tx.fraudProb * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={risk}
                      size="small"
                      color={RISK_CHIP_COLORS[risk]}
                      variant={risk === 'CRITICAL' ? 'filled' : 'outlined'}
                    />
                    <Chip
                      label={decision}
                      size="small"
                      color={DECISION_CHIP_COLORS[decision]}
                    />
                  </Box>
                </Box>
              )
            })}
          </Box>
          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
            * Preview dùng dữ liệu mẫu, không gọi API thật
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
