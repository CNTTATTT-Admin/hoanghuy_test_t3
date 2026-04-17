import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { apiPost } from '../../services/apiClient'
import type { TransactionForm, CheckResult, TransactionDetail } from './types'
import { INITIAL_FORM } from './types'
import { ParametersPanel } from './components/ParametersPanel'
import { ResultPanel, ResultEmpty } from './components/ResultPanel'
import { BatchUploadPanel } from './components/BatchUploadPanel'
import { TxTypeBadge } from '../../components/TxTypeBadge'

export function CheckTransaction() {
  const location = useLocation()
  const [form, setForm]           = useState<TransactionForm>(INITIAL_FORM)
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<CheckResult | null>(null)
  const [detail, setDetail]       = useState<TransactionDetail | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [sessionHistory, setSessionHistory] = useState<{ amount: number }[]>([])

  // Prefill form khi điều hướng từ trang Thông báo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const prefill = (location.state as { prefill?: Partial<TransactionForm> } | null)?.prefill
    if (prefill) {
      setForm(prev => ({ ...prev, ...prefill }))
      window.history.replaceState({}, '')
    }
  }, [])

  // Auto-update timestamp mỗi giây khi chưa đang loading
  useEffect(() => {
    if (loading) return
    const timer = setInterval(() => {
      setForm(prev => ({ ...prev, timestamp: new Date().toISOString() }))
    }, 1000)
    return () => clearInterval(timer)
  }, [loading])

  const handleFieldChange = (field: keyof TransactionForm, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value } as TransactionForm
      // Reset trường đặc thù khi đổi loại giao dịch
      if (field === 'type') {
        next.receiverAccount  = ''
        next.receiverName     = ''
        next.withdrawalMethod = ''
        next.fundSource       = ''
      }
      return next
    })
    setResult(null)
    setDetail(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ── Validation theo loại giao dịch ────────────────────────────────────────────
    if (form.type === 'TRANSFER' && !form.receiverAccount.trim()) {
      setError('Vui lòng nhập số tài khoản người nhận cho giao dịch TRANSFER.')
      return
    }
    if (form.type === 'CASH_OUT' && !form.withdrawalMethod) {
      setError('Vui lòng chọn hình thức rút tiền (ATM hoặc Quầy giao dịch).')
      return
    }
    if (form.type === 'CASH_IN' && !form.fundSource) {
      setError('Vui lòng chọn nguồn tiền nạp.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Map form fields → backend TransactionCheckRequest
      const payload = {
        user_id:        form.userId || 'anonymous',
        amount:         parseFloat(form.amount) || 0,
        type:           form.type,
        oldbalanceOrg:  parseFloat(form.balance) || 0,
        oldbalanceDest: parseFloat(form.balanceDest) || 0,
        timestamp:      new Date(form.timestamp).toISOString(),
        // Pass receiver_account for accurate dest_is_merchant feature
        ...(form.receiverAccount?.trim() && {
          receiver_account: form.receiverAccount.trim(),
        }),
        // Metadata bổ sung theo loại giao dịch
        ...(form.type === 'TRANSFER' && {
          receiver_name:    form.receiverName || undefined,
        }),
        ...(form.type === 'CASH_OUT' && {
          withdrawal_method: form.withdrawalMethod,
        }),
        ...(form.type === 'CASH_IN' && {
          fund_source: form.fundSource,
        }),
      }

      // Gọi API kiểm tra giao dịch
      const res = await apiPost<{
        is_fraud:        boolean
        risk_score:      number
        risk_level:      string
        reasons:         string[]
        explanation_text?: string | null
        timestamp:       string
        type?:           string
        decision:        string
        should_block:    boolean
        requires_review: boolean
        block_reason?:   string | null
        review_reason?:  string | null
        repeat_count?:       number | null
        repeat_risk_bonus?:  number | null
        base_risk_score?:    number | null
        final_risk_score?:   number | null
        account_status?:     string | null
      }>('/api/v1/transactions/check', payload)

      // Map response backend → CheckResult frontend
      const levelMap: Record<string, CheckResult['riskLevel']> = {
        LOW: 'low', MEDIUM: 'medium', HIGH: 'high', CRITICAL: 'critical',
      }
      const decisionMap: Record<string, CheckResult['decision']> = {
        BLOCKED: 'BLOCKED', PENDING: 'PENDING', APPROVED: 'APPROVED',
      }
      const mapped: CheckResult = {
        isFraud:        res.is_fraud,
        probability:    res.risk_score,
        riskScore:      Math.round(res.risk_score * 100),
        riskLevel:      levelMap[res.risk_level] ?? 'medium',
        explanation:    res.explanation_text || res.reasons.join(' '),
        reasons:        res.reasons,
        type:           res.type,
        decision:       decisionMap[res.decision] ?? 'APPROVED',
        shouldBlock:    res.should_block,
        requiresReview: res.requires_review,
        blockReason:    res.block_reason ?? null,
        reviewReason:   res.review_reason ?? null,
        repeatCount:       res.repeat_count ?? null,
        repeatRiskBonus:   res.repeat_risk_bonus ?? null,
        baseRiskScore:     res.base_risk_score ?? null,
        finalRiskScore:    res.final_risk_score ?? null,
        accountStatus:     res.account_status ?? null,
      }
      setResult(mapped)
      setSessionHistory(prev => [...prev, { amount: parseFloat(form.amount) || 0 }])

      // Khi giao dịch bị CHẶN — kích header bell cập nhật ngay lập tức
      if (mapped.decision === 'BLOCKED') {
        window.dispatchEvent(new CustomEvent('fraud-blocked'))
      }

      // Xây dựng TransactionDetail từ form + kết quả API
      const amt = parseFloat(form.amount) || 0
      setDetail({
        transaction_id:    null,
        type:              res.type ?? form.type ?? null,
        amount:            amt,
        name_orig:         form.userId || null,
        name_dest:         null,
        fraud_score:       res.risk_score,
        risk_level:        res.risk_level ?? null,
        decision:          (decisionMap[res.decision] ?? null) as TransactionDetail['decision'],
        status:            res.should_block ? 'BLOCKED' : res.requires_review ? 'PENDING_REVIEW' : 'PROCESSED',
        key_factors:       res.reasons ?? [],
        recommendations:   [],
        high_value_reason: amt > 10_000
          ? `Giá trị giao dịch ${amt.toLocaleString('vi-VN')} vượt ngưỡng cảnh báo giao dịch lớn.`
          : null,
        processed_at:      res.timestamp ?? null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      {/* ── Page header ── */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
          Kiểm tra giao dịch
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af', mt: 0.5 }}>
          Thực hiện đánh giá rủi ro độ trung thực cao trên các giao dịch đơn lẻ bằng cách sử dụng động cơ suy luận AI Sovereign của chúng tôi.
        </Typography>
      </Box>

      {/* ── Session bar ── */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mb: 2.5 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 1.5,
            py: 0.5,
            borderRadius: '9999px',
            border: '1px solid #2a3040',
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#6b7280',
          }}
        >
          SESSION: #AF-9021
        </Box>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: '9999px',
            border: '1px solid #16a34a',
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#22c55e',
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#22c55e',
              '@keyframes blink': {
                '0%, 100%': { opacity: 1 },
                '50%':       { opacity: 0.2 },
              },
              animation: 'blink 1.4s infinite',
            }}
          />
          ĐỘNG CƠ TRỰC TIẾP
        </Box>
      </Box>

      {/* ── 2-column layout ── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <ParametersPanel
            form={form}
            loading={loading}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
            sessionHistory={sessionHistory}
          />
          <BatchUploadPanel />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          {error && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#2d0a0a', border: '1px solid #7f1d1d', borderRadius: 1 }}>
              <Typography sx={{ color: '#f87171', fontSize: '13px' }}>{error}</Typography>
            </Box>
          )}
          {result ? (
            <>
              {result.type && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>Loại giao dịch:</Typography>
                  <TxTypeBadge type={result.type} showFull />
                </Box>
              )}
              <ResultPanel result={result} detail={detail} />
            </>
          ) : <ResultEmpty />}
        </Grid>
      </Grid>
    </Box>
  )
}
