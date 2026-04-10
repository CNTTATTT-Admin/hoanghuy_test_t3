import { useEffect, useRef } from 'react'

/**
 * Hook thực thi callback định kỳ (polling).
 * Dùng cho auto-refresh dữ liệu dashboard / alerts.
 *
 * @param callback   Hàm gọi mỗi interval (phải stable — dùng useCallback ở nơi gọi)
 * @param intervalMs Khoảng thời gian giữa các lần gọi (ms). 0 hoặc âm → tắt polling.
 * @param immediate  Gọi ngay lập tức khi mount (mặc định: false)
 */
export function usePolling(
  callback: () => void,
  intervalMs: number,
  immediate = false,
) {
  // Luôn giữ phiên bản mới nhất của callback
  const savedCallback = useRef(callback)
  useEffect(() => { savedCallback.current = callback }, [callback])

  useEffect(() => {
    // Không poll nếu interval <= 0
    if (intervalMs <= 0) return

    // Gọi ngay lần đầu nếu immediate = true
    if (immediate) savedCallback.current()

    const id = setInterval(() => savedCallback.current(), intervalMs)
    // Dọn dẹp khi unmount hoặc interval thay đổi
    return () => clearInterval(id)
  }, [intervalMs, immediate])
}
