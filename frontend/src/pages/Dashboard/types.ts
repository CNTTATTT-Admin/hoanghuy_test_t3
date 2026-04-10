/** Kiểu dữ liệu dùng chung cho Dashboard modals */

export interface InferenceRecord {
  request_id:       string
  user_id:          string
  transaction_type: string
  amount:           number
  old_balance:      number
  new_balance:      number
  dest_old_balance: number
  is_fraud:         boolean
  risk_score:       number
  risk_level:       string           // LOW | MEDIUM | HIGH | CRITICAL
  features:         Record<string, unknown>
  reasons:          string[]
  created_at:       string           // ISO timestamp
  // ── Trường cho detail view ──
  id:               string
  type:             string | null
  transaction_id:   string | null
  name_orig:        string | null
  name_dest:        string | null
  decision:         string | null
  fraud_score:      number
  key_factors:      string[]
  high_value_reason: string | null
  timestamp:        string
}

export interface InferenceHistoryResponse {
  transactions: InferenceRecord[]
  total:        number
}
