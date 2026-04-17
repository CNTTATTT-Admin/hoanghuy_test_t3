import { useState, useEffect, useCallback } from 'react'
import { apiGet } from '../../../services/apiClient'
import { usePolling } from '../../../hooks/usePolling'
import { normalizeTxType } from '../../../utils/transactionType'
import type { AlertRecord, RiskLevel, AlertStatus } from '../types'

// --- Shape trả về từ backend ---
interface BackendAlert {
  id:          string
  alert_id?:   string
  type:        string
  status:      string
  risk_score:  number
  amount?:     number
  user_id?:    string
  transaction_id?: string
  created_at:  string
  details?:    Record<string, unknown>
  assigned_to?: string | null
}

interface UseAlertsOptions {
  status?: AlertStatus | 'all'
  limit?:  number
  offset?: number
  pollingMs?: number   // 0 = tắt, >0 = poll định kỳ (ms)
}

/** Chuyển đổi backend response → frontend AlertRecord */
function mapAlert(a: BackendAlert): AlertRecord {
  // Fallback: lấy risk_score từ top-level (sau khi backend flatten) hoặc từ details
  const rawScore = Number(
    a.risk_score ??
    (a.details as Record<string, unknown>)?.risk_score ??
    0
  )
  // Backend inference lưu risk_score theo thang 0–1
  const score = rawScore > 1 ? rawScore / 100 : rawScore  // chuẩn hóa về 0–1

  let riskLevel: RiskLevel = 'low'
  if (score >= 0.85)      riskLevel = 'critical'
  else if (score >= 0.65) riskLevel = 'high'
  else if (score >= 0.40) riskLevel = 'medium'

  const statusMap: Record<string, AlertStatus> = {
    open:            'open',
    active:          'open',           // DB legacy default
    investigating:   'investigating',
    resolved:        'resolved',
    acknowledged:    'resolved',       // DB legacy acknowledge
    false_positive:  'false_positive',
    closed:          'resolved',       // phòng trường hợp DB dùng 'closed'
    blocked:         'blocked',        // giao dịch bị chặn tự động
    confirmed_fraud: 'confirmed_fraud', // analyst xác nhận là fraud
  }

  // Fallback chain cho mã giao dịch — ưu tiên top-level (backend đã flatten)
  const txId = (
    a.transaction_id ??
    (a.details?.transaction_id as string) ??
    (a.details?.tx_id as string) ??
    (a.details?.txId as string) ??
    a.user_id ??
    '—'
  )

  const amount = Number(a.amount ?? a.details?.amount ?? 0)

  // Lý do model flag — lấy từ details.reasons / explanation / shap_reasons
  const modelExplanation: string[] = (
    (a.details?.reasons as string[]) ??
    (a.details?.explanation as string[]) ??
    (a.details?.shap_reasons as string[]) ??
    []
  )

  // Thời gian chờ xử lý (phút)
  const createdTime = new Date(a.created_at).getTime()
  const waitTimeMinutes = Math.max(0, Math.round((Date.now() - createdTime) / 60000))

  // SLA status
  const slaStatus: 'normal' | 'warning' | 'overdue' =
    waitTimeMinutes >= 60 ? 'overdue' :
    waitTimeMinutes >= 30 ? 'warning' : 'normal'

  // Priority score (0–100): kết hợp risk, amount, thời gian chờ
  const riskWeight   = score * 10 * 4                         // max 40
  const amountWeight = Math.min(amount / 100_000, 30)         // max 30, chuẩn hoá theo 10tr
  const timeWeight   = Math.min(waitTimeMinutes / 2, 30)      // max 30
  const priorityScore = Math.round(Math.min(riskWeight + amountWeight + timeWeight, 100))

  return {
    id:        a.id ?? a.alert_id ?? '—',
    txId,
    // Loại bỏ a.type khỏi fallback — a.type là loại cảnh báo (FRAUD_DETECTED), không phải loại giao dịch
    txType:    normalizeTxType((a.details?.tx_type as string) ?? (a.details?.type as string)),
    amount,
    nameOrig:  (a.details?.nameOrig as string) ?? (a.details?.name_orig as string) ?? '—',
    nameDest:  (a.details?.nameDest as string) ?? (a.details?.name_dest as string) ?? '—',
    riskLevel,
    riskScore: parseFloat((score * 10).toFixed(1)),  // thang 0–10, 1 chữ số thập phân
    status:    statusMap[a.status] ?? 'open',
    createdAt: new Date(a.created_at).toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }),
    assignee:  a.assigned_to ?? 'Chưa phân công',
    details:   a.details ?? {},
    modelExplanation,
    priorityScore,
    waitTimeMinutes,
    slaStatus,
  }
}

/** Hook tải danh sách cảnh báo từ backend */
export function useAlerts(options: UseAlertsOptions = {}) {
  const { limit = 50, offset = 0, pollingMs = 0 } = options

  const [alerts, setAlerts]         = useState<AlertRecord[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAlerts = useCallback(() => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      limit:  String(limit),
      offset: String(offset),
    })

    apiGet<{ alerts: BackendAlert[]; total: number }>(
      `/api/v1/alerts?${params.toString()}`
    )
      .then((data) => {
        setAlerts((data.alerts ?? []).map(mapAlert))
        setTotal(data.total ?? 0)
        setLastUpdated(new Date())
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [limit, offset])

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  // Polling tự động — chỉ khi pollingMs > 0
  usePolling(fetchAlerts, pollingMs)

  return { alerts, total, loading, error, lastUpdated, refetch: fetchAlerts }
}
