// frontend/src/services/apiClient.ts
// Lớp API client dùng chung — wrapper trên browser fetch native

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000' // URL cơ sở cho API, lấy từ biến môi trường hoặc mặc định localhost

/**
 * Gọi API chung, tự động set header JSON và xử lý lỗi
 */
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> { // Hàm gọi API chung, trả về dữ liệu đã parse với kiểu T do caller chỉ định
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, { 
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  }) // Gọi API với URL đầy đủ, tự động thêm header Content-Type: application/json và cho phép ghi đè header nếu cần
  if (!res.ok) { // Nếu không ok, lỗi xử lý lỗi HTTP
    let message = res.statusText // Mặc định là status text, sẽ cố gắng parse lỗi chi tiết hơn từ body nếu có
    try { // Cố gắng parse lỗi chi tiết từ body, nếu backend trả về JSON có trường detail
      const err = await res.json() 
      // Pydantic 422 trả detail là mảng, 4xx/5xx thường là string
      if (Array.isArray(err.detail)) { // Nếu detail là mảng, ghép thành chuỗi lỗi chi tiết hơn
        message = err.detail.map((e: { msg?: string; loc?: string[] }) =>
          `${(e.loc ?? []).join('.')}: ${e.msg ?? 'invalid'}`
        ).join('; ')
      } else {
        message = err.detail ?? err.message ?? message
      }
    } catch {
      /* bỏ qua parse error */
    }
    throw new Error(`[${res.status}] ${message}`) 
  }
  return res.json() as Promise<T> // Trả về dữ liệu đã parse từ JSON, với kiểu T do caller chỉ định
}

/** GET request */
export const apiGet = <T>(path: string) => apiFetch<T>(path) // Hàm gọi API với method GET, chỉ cần cung cấp path, trả về dữ liệu đã parse với kiểu T do caller chỉ định,
// path là đường dẫn sau BASE_URL, ví dụ '/api/v1/stats', sẽ trả về dữ liệu đã parse với kiểu T do caller chỉ định

/** POST request với body JSON */
export const apiPost = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }) // Hàm gọi API với method POST, gửi body dưới dạng JSON, trả về dữ liệu đã parse với kiểu T do caller chỉ định
