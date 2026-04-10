export type TxType = 'CASH_IN' | 'CASH_OUT' | 'DEBIT' | 'PAYMENT' | 'TRANSFER' | 'UNKNOWN';

export interface TxTypeDisplay {
  label:     string;  // Nhãn ngắn hiển thị trên badge
  labelFull: string;  // Tên đầy đủ tiếng Anh
  labelVi:   string;  // Tên tiếng Việt (dùng cho tooltip)
  bgColor:   string;  // Inline background color
  color:     string;  // Inline text color
}

const TYPE_MAP: Record<TxType, TxTypeDisplay> = {
  CASH_IN:  { label: 'CASH IN',  labelFull: 'Cash Deposit',      labelVi: 'Nạp tiền mặt',     bgColor: '#dcfce7', color: '#15803d' },
  CASH_OUT: { label: 'CASH OUT', labelFull: 'Cash Withdrawal',   labelVi: 'Rút tiền mặt',     bgColor: '#fed7aa', color: '#c2410c' },
  DEBIT:    { label: 'DEBIT',    labelFull: 'Debit Transaction',  labelVi: 'Giao dịch ghi nợ', bgColor: '#dbeafe', color: '#1d4ed8' },
  PAYMENT:  { label: 'PAYMENT',  labelFull: 'Payment',            labelVi: 'Thanh toán',        bgColor: '#f3e8ff', color: '#7e22ce' },
  TRANSFER: { label: 'TRANSFER', labelFull: 'Bank Transfer',      labelVi: 'Chuyển khoản',      bgColor: '#cffafe', color: '#0e7490' },
  UNKNOWN:  { label: 'N/A',      labelFull: 'Unknown Type',       labelVi: 'Không xác định',    bgColor: '#f3f4f6', color: '#6b7280' },
};

/**
 * Chuẩn hóa bất kỳ chuỗi type nào → TxType.
 * Trả về 'UNKNOWN' nếu null / undefined / không hợp lệ / '—'.
 */
export function normalizeTxType(raw: string | null | undefined): TxType {
  if (!raw || raw === '—') return 'UNKNOWN';
  const key = raw.trim().toUpperCase().replace(/[-\s]/g, '_');
  return (key in TYPE_MAP ? key : 'UNKNOWN') as TxType;
}

export function getTxTypeDisplay(raw: string | null | undefined): TxTypeDisplay {
  return TYPE_MAP[normalizeTxType(raw)];
}
