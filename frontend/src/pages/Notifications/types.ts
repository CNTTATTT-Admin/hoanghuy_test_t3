export interface NotificationItem {
  id:            string
  transactionId: string          // Mã giao dịch
  txType:        string          // CASH_IN | CASH_OUT | DEBIT | PAYMENT | TRANSFER
  amount:        number
  riskScore:     number          // 0–1
  riskLevel:     string          // low | medium | high | critical
  decision:      string          // APPROVED | PENDING | BLOCKED
  status:        string          // open | investigating | resolved | false_positive | blocked
  source:        'single' | 'batch'   // Nguồn: kiểm tra đơn lẻ hay batch CSV
  blockReason:   string | null
  reviewReason:  string | null
  nameOrig:      string          // Tài khoản nguồn
  nameDest:      string          // Tài khoản đích
  reasons:       string[]        // Lý do từ ML model
  createdAt:     string          // Timestamp hiển thị (vi-VN)
  rawCreatedAt:  string          // ISO string gốc
  details:       Record<string, unknown>   // Raw details từ backend
}
