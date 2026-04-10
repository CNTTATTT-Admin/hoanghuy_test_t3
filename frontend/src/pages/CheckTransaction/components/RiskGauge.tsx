import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface RiskGaugeProps {
  score: number
  color: string
}

export function RiskGauge({ score, color }: RiskGaugeProps) {
  const size = 120
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const offset = circumference - progress

  return (
    <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e2330"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: '2rem',
            fontWeight: 700,
            color,
            lineHeight: 1,
          }}
        >
          {score}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.6rem',
            fontWeight: 600,
            color: '#6b7280',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            mt: 0.5,
          }}
        >
          RISK SCORE
        </Typography>
      </Box>
    </Box>
  )
}
