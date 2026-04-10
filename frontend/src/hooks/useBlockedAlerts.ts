import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet } from '../services/apiClient';

export interface BlockedNotification {
  id:                string;
  transaction_id:    string;
  amount:            number | null;
  tx_type:           string | null;
  blocked_at:        string;
  fraud_probability: number;
}

interface AlertDetails {
  amount?:      number | null;
  tx_type?:     string | null;
  risk_score?:  number | null;
  transaction_id?: string | null;
}

interface AlertRecord {
  id?:            string | number;
  alert_id?:      string;
  transaction_id?: string | null;
  details?:       AlertDetails;
  risk_score?:    number | null;
  created_at:     string;
}

/**
 * Poll backend mỗi `pollingMs` ms để lấy danh sách giao dịch bị chặn.
 * Dùng trong Header để hiển thị notification bell.
 */
export function useBlockedAlerts(pollingMs = 15_000) {
  const [notifications, setNotifications] = useState<BlockedNotification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const mountedRef = useRef(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await apiGet<{ alerts: AlertRecord[] }>(
        '/api/v1/alerts?alert_type=FRAUD_BLOCKED&status=blocked&limit=20'
      )
      if (!mountedRef.current) return;
      const mapped: BlockedNotification[] = (data.alerts ?? []).map((a: AlertRecord) => ({
        id:                String(a.id ?? a.alert_id ?? ''),
        transaction_id:    a.transaction_id ?? a.details?.transaction_id ?? '—',
        amount:            a.details?.amount     ?? null,
        tx_type:           a.details?.tx_type    ?? null,
        blocked_at:        a.created_at,
        fraud_probability: a.details?.risk_score ?? a.risk_score ?? 0,
      }));
      setNotifications(mapped);
      setUnreadCount(prev => mapped.length > prev ? mapped.length : prev);
    } catch {
      // Giữ state cũ nếu request lỗi — không reset về []
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const initialTimer = setTimeout(fetchAlerts, 0);
    const timer = setInterval(fetchAlerts, pollingMs);
    return () => {
      mountedRef.current = false;
      clearTimeout(initialTimer);
      clearInterval(timer);
    };
  }, [fetchAlerts, pollingMs]);

  // Lắng nghe sự kiện fraud-blocked và batch-fraud-blocked để refresh ngay lập tức
  useEffect(() => {
    const handler = () => { setTimeout(fetchAlerts, 2000) };
    window.addEventListener('fraud-blocked', handler);
    window.addEventListener('batch-fraud-blocked', handler);
    return () => {
      window.removeEventListener('fraud-blocked', handler);
      window.removeEventListener('batch-fraud-blocked', handler);
    };
  }, [fetchAlerts]);

  const markAllRead = useCallback(() => setUnreadCount(0), []);

  return { notifications, unreadCount, markAllRead, refresh: fetchAlerts };
}
