export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'open' | 'investigating' | 'resolved' | 'false_positive' | 'blocked'

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
}

export const riskLabels: Record<RiskLevel, string> = {
  low: 'Thấp', medium: 'Trung bình', high: 'Cao', critical: 'Nguy hiểm',
}

export const statusConfig: Record<AlertStatus, { label: string; color: 'warning' | 'info' | 'success' | 'default' | 'error' }> = {
  open:           { label: 'Mở',            color: 'warning' },
  investigating:  { label: 'Đang xử lý',    color: 'info' },
  resolved:       { label: 'Đã giải quyết', color: 'success' },
  false_positive: { label: 'Nhận định sai', color: 'default' },
  blocked:        { label: 'Đã chặn',        color: 'error' },
}


