export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus =
  | 'open'
  | 'investigating'
  | 'resolved'
  | 'false_positive'
  | 'blocked'
  | 'confirmed_fraud'

export type SortField = 'priority' | 'time' | 'risk' | 'amount' | 'sla'
export type SortDirection = 'asc' | 'desc'

export interface AlertRecord {
  id:        string
  txId:      string
  txType?:   string                      // loại giao dịch: TRANSFER, CASH_OUT, ...
  amount:    number
  nameOrig?: string                      // tài khoản người gửi
  nameDest?: string                      // tài khoản người nhận
  riskLevel: RiskLevel
  riskScore: number                      // thang 0–10
  status:    AlertStatus
  createdAt: string
  assignee:  string
  details?:  Record<string, unknown>     // raw details từ backend (JSONB)

  // ═══ Trường bổ sung (Prompt 23) ═══
  modelExplanation?: string[]            // lý do model flag (từ SHAP/reasons)
  priorityScore:     number             // 0–100, tổng hợp risk + amount + thời gian chờ
  waitTimeMinutes:   number             // số phút kể từ khi tạo alert
  slaStatus:         'normal' | 'warning' | 'overdue'
}

export const riskLabels: Record<RiskLevel, string> = {
  low: 'Thấp', medium: 'Trung bình', high: 'Cao', critical: 'Nguy hiểm',
}

export const statusConfig: Record<AlertStatus, { label: string; color: 'warning' | 'info' | 'success' | 'default' | 'error' }> = {
  open:            { label: 'Mở',                   color: 'warning' },
  investigating:   { label: 'Đang xử lý',           color: 'info' },
  resolved:        { label: 'Đã giải quyết',        color: 'success' },
  false_positive:  { label: 'Nhận định sai',        color: 'default' },
  blocked:         { label: 'Đã chặn',               color: 'error' },
  confirmed_fraud: { label: 'Đã xác nhận gian lận', color: 'error' },
}


