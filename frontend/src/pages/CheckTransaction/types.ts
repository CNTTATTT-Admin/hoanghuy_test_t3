export type TransactionType = 'PAYMENT' | 'TRANSFER' | 'CASH_OUT' | 'CASH_IN' | 'DEBIT'
export type Currency = 'USD' | 'VND' | 'EUR'

export interface TransactionForm {
  userId:      string    // → user_id / nameOrig
  type:        TransactionType
  currency:    Currency
  amount:      string    // → amount
  balance:     string    // → oldbalanceOrg (số dư nguồn trước GD)
  balanceDest: string    // → oldbalanceDest (số dư đích trước GD) — dùng cho feature dest_is_empty
  timestamp:   string    // → timestamp (auto)

  // ── TRANSFER: Chuyển khoản ────────────────────────────────────────────────
  receiverAccount: string   // Số tài khoản nhận — BẮT BUỘC
  receiverName:    string   // Tên người nhận — tùy chọn

  // ── CASH_OUT: Rút tiền mặt ───────────────────────────────────────────────
  withdrawalMethod: 'ATM' | 'COUNTER' | ''   // BẮT BUỘC

  // ── CASH_IN: Nạp tiền ────────────────────────────────────────────────────
  fundSource: 'CASH' | 'BANK' | 'WALLET' | ''   // BẮT BUỘC
}

export interface CheckResult {
  isFraud:        boolean
  probability:    number
  riskScore:      number
  riskLevel:      'low' | 'medium' | 'high' | 'critical'
  explanation:    string
  reasons:        string[]   // Lý do riêng lẻ từ API (hiển thị trong ReasoningLog)
  type?:          string     // Loại giao dịch trả về từ API
  decision:       'APPROVED' | 'PENDING' | 'BLOCKED'
  shouldBlock:    boolean
  requiresReview: boolean
  blockReason?:   string | null
  reviewReason?:  string | null
}

export interface TransactionDetail {
  transaction_id:    string | null
  type:              string | null     // 'CASH_IN' | 'CASH_OUT' | 'DEBIT' | 'PAYMENT' | 'TRANSFER' | null
  amount:            number | null
  name_orig:         string | null     // Người gửi / tài khoản nguồn
  name_dest:         string | null     // Người nhận / tài khoản đích
  fraud_score:       number | null     // 0–1
  risk_level:        string | null     // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  decision:          'APPROVED' | 'PENDING' | 'BLOCKED' | null
  status:            string | null
  key_factors:       string[]          // Danh sách yếu tố rủi ro từ ML model
  recommendations:   string[]
  high_value_reason: string | null     // Lý do cảnh báo giá trị cao
  processed_at:      string | null
}

export const EMPTY_DETAIL: TransactionDetail = {
  transaction_id:    null,
  type:              null,
  amount:            null,
  name_orig:         null,
  name_dest:         null,
  fraud_score:       null,
  risk_level:        null,
  decision:          null,
  status:            null,
  key_factors:       [],
  recommendations:   [],
  high_value_reason: null,
  processed_at:      null,
}

export const TX_TYPES: TransactionType[] = ['PAYMENT', 'TRANSFER', 'CASH_OUT', 'CASH_IN', 'DEBIT']
export const CURRENCIES: Currency[] = ['USD', 'VND', 'EUR']

export const INITIAL_FORM: TransactionForm = {
  userId:           '',
  type:             'PAYMENT',
  currency:         'USD',
  amount:           '',
  balance:          '',
  balanceDest:      '',
  timestamp:        new Date().toISOString(),
  receiverAccount:  '',
  receiverName:     '',
  withdrawalMethod: '',
  fundSource:       '',
}
