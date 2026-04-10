import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import { apiPost } from '../../../services/apiClient'

interface BatchRow {
  user_id: string
  type: string
  amount: number
  oldbalanceOrg: number
  oldbalanceDest: number
}

interface BatchResult {
  row: BatchRow
  is_fraud: boolean
  risk_score: number
  risk_level: string
  decision?: string
  block_reason?: string | null
}

// Cột bắt buộc (lowercase kề cả viết cấu, display giữ nguyên)
const REQUIRED_COLUMNS: { key: string; display: string }[] = [
  { key: 'user_id',        display: 'user_id' },
  { key: 'type',          display: 'type' },
  { key: 'amount',        display: 'amount' },
  { key: 'oldbalanceorg', display: 'oldbalanceOrg' },
  { key: 'oldbalancedest',display: 'oldbalanceDest' },
]

function parseCSV(text: string): BatchRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) throw new Error('CSV phải có ít nhất 1 dòng header và 1 dòng dữ liệu')
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

  // Validate 5 cột bắt buộc
  const missingCols = REQUIRED_COLUMNS
    .filter(c => !headers.includes(c.key))
    .map(c => c.display)
  if (missingCols.length > 0) {
    throw new Error(`File CSV thiếu cột bắt buộc: ${missingCols.join(', ')}`)
  }

  return lines.slice(1).map((line, idx) => {
    const vals = line.split(',').map(v => v.trim())
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = vals[i] ?? '' })
    if (!obj['user_id']) throw new Error(`Dòng ${idx + 2}: thiếu trường bắt buộc "user_id"`)
    if (!obj['type'])    throw new Error(`Dòng ${idx + 2}: thiếu trường bắt buộc "type"`)
    if (!obj['amount'])  throw new Error(`Dòng ${idx + 2}: thiếu trường bắt buộc "amount"`)
    return {
      user_id:        obj['user_id'],
      type:           obj['type'].toUpperCase(),
      amount:         parseFloat(obj['amount']) || 0,
      oldbalanceOrg:  parseFloat(obj['oldbalanceorg'] ?? obj['oldbalance_org'] ?? '0') || 0,
      oldbalanceDest: parseFloat(obj['oldbalancedest'] ?? obj['oldbalance_dest'] ?? '0') || 0,
    }
  })
}

export function BatchUploadPanel() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [results, setResults]   = useState<BatchResult[]>([])
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setError(null)
    setResults([])
    setLoading(true)

    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (rows.length > 500) {
        throw new Error(`Tối đa 500 giao dịch mỗi batch (hiện tại: ${rows.length})`)
      }

      const payload = rows.map(r => ({
        step:           1,
        type:           r.type,
        amount:         r.amount,
        nameOrig:       r.user_id,
        oldbalanceOrg:  r.oldbalanceOrg,
        newbalanceOrig: Math.max(r.oldbalanceOrg - r.amount, 0),
        nameDest:       'BATCH_COUNTERPARTY',
        oldbalanceDest: r.oldbalanceDest,
        newbalanceDest: r.oldbalanceDest + r.amount,
      }))

      const res = await apiPost<{
        total_transactions: number
        results: Array<{
          is_fraud?: boolean
          fraud_score?: number
          model_score?: number
          risk_level?: string
          explanation?: { risk_level?: string }
          decision?: string
          should_block?: boolean
          block_reason?: string | null
        }>
      }>('/api/v1/batch-detect-fraud', payload)

      const mapped: BatchResult[] = rows.map((row, i) => {
        const r     = res.results[i] ?? {}
        const score = r.fraud_score ?? r.model_score ?? 0
        const level = r.risk_level ?? r.explanation?.risk_level ?? (score >= 0.7 ? 'HIGH' : score >= 0.3 ? 'MEDIUM' : 'LOW')
        return {
          row,
          is_fraud:    r.is_fraud ?? score >= 0.5,
          risk_score:  score,
          risk_level:  level.toUpperCase(),
          decision:    r.decision,
          block_reason: r.block_reason ?? null,
        }
      })
      setResults(mapped)

      // Kích chuông header nếu có giao dịch bị BLOCKED
      if (mapped.some(r => r.decision === 'BLOCKED')) {
        // Event cũ — backward compat
        window.dispatchEvent(new CustomEvent('fraud-blocked'))
        // Event mới — kèm chi tiết batch blocked count
        window.dispatchEvent(new CustomEvent('batch-fraud-blocked', {
          detail: {
            totalTransactions: mapped.length,
            blockedCount: mapped.filter(r => r.decision === 'BLOCKED').length,
            source: 'batch-csv',
          },
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const fraudCount   = results.filter(r => r.is_fraud).length
  const highCount    = results.filter(r => r.risk_level === 'HIGH').length
  const blockedCount = results.filter(r => r.decision === 'BLOCKED').length

  return (
    <Box
      sx={{
        bgcolor: '#0d1117',
        border: '1px solid #1e2330',
        borderRadius: '8px',
        p: 2.5,
        mt: 2,
      }}
    >
      <Typography
        sx={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#6b7280',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          mb: 2,
        }}
      >
        BATCH CHECK — TẢI LÊN CSV
      </Typography>

      {/* Hướng dẫn format CSV — collapsible */}
      <Accordion
        disableGutters
        sx={{
          bgcolor: '#0d1117',
          border: '1px solid #1e2330',
          borderRadius: '6px !important',
          mb: 2,
          '&:before': { display: 'none' },
          boxShadow: 'none',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: '#6b7280', fontSize: 18 }} />}
          sx={{ minHeight: 36, '& .MuiAccordionSummary-content': { my: 0.75 } }}
        >
          <Typography sx={{ fontSize: '12px', color: '#9ca3af' }}>
            📋 Hướng dẫn format file CSV
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 1.5 }}>
          <Typography sx={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.8 }}>
            <strong style={{ color: '#9ca3af' }}>Cột bắt buộc cho TẤT CẢ loại giao dịch:</strong>
          </Typography>
          {[
            ['user_id', 'Mã tài khoản nguồn (VD: C1234567890)'],
            ['type', 'Loại: CASH_IN | CASH_OUT | DEBIT | PAYMENT | TRANSFER'],
            ['amount', 'Số tiền giao dịch (> 0)'],
            ['oldbalanceOrg', 'Số dư tài khoản nguồn trước giao dịch'],
            ['oldbalanceDest', 'Số dư tài khoản đích trước giao dịch (0 nếu tài khoản mới)'],
          ].map(([col, desc]) => (
            <Typography key={col} sx={{ fontSize: '11px', color: '#6b7280', display: 'flex', gap: 1, mt: 0.3 }}>
              <span style={{ color: '#818cf8', fontFamily: 'monospace', minWidth: 120 }}>{col}</span>
              <span>{desc}</span>
            </Typography>
          ))}
          <Typography sx={{ fontSize: '11px', color: '#6b7280', mt: 1, lineHeight: 1.8 }}>
            <strong style={{ color: '#9ca3af' }}>Cột tùy chọn theo loại:</strong>
          </Typography>
          {[
            ['TRANSFER', 'receiver_account, receiver_name'],
            ['CASH_OUT', 'withdrawal_method (ATM / COUNTER)'],
            ['CASH_IN', 'fund_source (CASH / BANK / WALLET)'],
          ].map(([type, cols]) => (
            <Typography key={type} sx={{ fontSize: '11px', color: '#6b7280', display: 'flex', gap: 1, mt: 0.3 }}>
              <span style={{ color: '#22d3ee', fontFamily: 'monospace', minWidth: 120 }}>{type}</span>
              <span>{cols}</span>
            </Typography>
          ))}
          <Typography sx={{ fontSize: '11px', color: '#374151', mt: 1.5, fontFamily: 'monospace', bgcolor: '#141922', p: 1, borderRadius: 1 }}>
            user_id,type,amount,oldbalanceOrg,oldbalanceDest
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Upload area */}
      <Box
        onClick={() => fileRef.current?.click()}
        sx={{
          border: '1px dashed #2a3040',
          borderRadius: '6px',
          p: 2.5,
          textAlign: 'center',
          cursor: 'pointer',
          mb: 2,
          '&:hover': { borderColor: '#6366f1', bgcolor: '#0f1219' },
        }}
      >
        <input ref={fileRef} type="file" accept=".csv" hidden onChange={handleFile} />
        <UploadFileOutlinedIcon sx={{ color: '#6b7280', fontSize: 28, mb: 1 }} />
        <Typography sx={{ fontSize: '13px', color: '#9ca3af' }}>
          {fileName ? `📄 ${fileName}` : 'Kéo thả hoặc click để chọn file .csv'}
        </Typography>
        <Typography sx={{ fontSize: '11px', color: '#6b7280', mt: 0.5 }}>
          Tối đa 500 giao dịch. Cột bắt buộc: user_id, type, amount, oldbalanceOrg, oldbalanceDest
        </Typography>
      </Box>

      {/* Format hint */}
      <Typography sx={{ fontSize: '11px', color: '#6b7280', mb: 1.5 }}>
        Format: <code style={{ color: '#818cf8' }}>user_id,type,amount,oldbalanceOrg,oldbalanceDest</code>
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CircularProgress size={16} sx={{ color: '#6366f1' }} />
          <Typography sx={{ fontSize: '12px', color: '#9ca3af' }}>Đang phân tích batch...</Typography>
        </Box>
      )}

      {error && (
        <Typography sx={{ fontSize: '12px', color: '#ef4444', mb: 2 }}>⚠ {error}</Typography>
      )}

      {/* Cảnh báo tức thì cho giao dịch bị CHẶN */}
      {results.filter(r => r.decision === 'BLOCKED').length > 0 && (
        <Box
          sx={{
            mb: 2, p: 1.5,
            bgcolor: '#2d0a0a',
            border: '1px solid #dc2626',
            borderRadius: '8px',
          }}
        >
          <Typography sx={{ color: '#ef4444', fontWeight: 700, fontSize: '13px', mb: 1 }}>
            🚫 {results.filter(r => r.decision === 'BLOCKED').length} giao dịch đã bị CHẶN
          </Typography>
          {results
            .map((r, i) => ({ ...r, index: i }))
            .filter(r => r.decision === 'BLOCKED')
            .map(r => (
              <Box
                key={r.index}
                sx={{ py: 0.5, borderBottom: '1px solid #3f1a1a', '&:last-child': { borderBottom: 'none' } }}
              >
                <Typography sx={{ color: '#f87171', fontSize: '11px', fontFamily: 'monospace' }}>
                  #{r.index + 1} | {r.row.user_id} | {r.row.type} | ${r.row.amount.toLocaleString('en-US')} | Risk: {(r.risk_score * 100).toFixed(0)}%
                  {r.block_reason ? ` | ${r.block_reason}` : ''}
                </Typography>
              </Box>
            ))}
        </Box>
      )}

      {/* Summary chips */}
      {results.length > 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`${results.length} giao dịch`}
              size="small"
              sx={{ bgcolor: '#1e2330', color: '#9ca3af', fontSize: '11px' }}
            />
            <Chip
              label={`${fraudCount} gian lận`}
              size="small"
              sx={{
                bgcolor: fraudCount > 0 ? '#3f1a1a' : '#1e2330',
                color:   fraudCount > 0 ? '#f87171' : '#9ca3af',
                fontSize: '11px',
              }}
            />
            <Chip
              label={`${highCount} HIGH risk`}
              size="small"
              sx={{
                bgcolor: highCount > 0 ? '#3f2a10' : '#1e2330',
                color:   highCount > 0 ? '#fb923c' : '#9ca3af',
                fontSize: '11px',
              }}
            />
            <Chip
              label={`${blockedCount} đã chặn`}
              size="small"
              sx={{
                bgcolor: blockedCount > 0 ? '#3f1a1a' : '#1e2330',
                color:   blockedCount > 0 ? '#ef4444' : '#9ca3af',
                fontSize: '11px',
                fontWeight: blockedCount > 0 ? 700 : 400,
              }}
            />
          </Box>

          {/* Results table */}
          <Box sx={{ overflowX: 'auto', maxHeight: 320, overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {['#', 'User ID', 'Loại', 'Số tiền', 'Risk', 'Điểm', 'Quyết định', 'Hành động'].map(h => (
                    <TableCell
                      key={h}
                      sx={{
                        bgcolor: '#0d1117 !important',
                        color: '#6b7280',
                        fontSize: '11px',
                        borderColor: '#1e2330',
                        fontWeight: 600,
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((r, i) => (
                  <TableRow key={i} sx={{ '& td': { borderColor: '#1e2330' } }}>
                    <TableCell sx={{ color: '#6b7280', fontSize: '12px' }}>{i + 1}</TableCell>
                    <TableCell sx={{ color: '#d1d5db', fontSize: '12px', fontFamily: 'monospace' }}>
                      {r.row.user_id}
                    </TableCell>
                    <TableCell sx={{ color: '#d1d5db', fontSize: '12px' }}>{r.row.type}</TableCell>
                    <TableCell sx={{ color: '#818cf8', fontSize: '12px' }}>
                      ${r.row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.risk_level}
                        size="small"
                        sx={{
                          fontSize: '10px',
                          height: 18,
                          bgcolor:
                            r.risk_level === 'HIGH'   ? '#3f1a1a' :
                            r.risk_level === 'MEDIUM' ? '#3f2a10' : '#1a3020',
                          color:
                            r.risk_level === 'HIGH'   ? '#f87171' :
                            r.risk_level === 'MEDIUM' ? '#fb923c' : '#4ade80',
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: r.risk_score >= 0.5 ? '#f87171' : '#9ca3af',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {(r.risk_score * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.decision === 'BLOCKED' ? 'ĐÃ CHẶN' : r.decision === 'PENDING' ? 'CHỜ DUYỆT' : 'CHO PHÉP'}
                        size="small"
                        sx={{
                          fontSize: '10px',
                          height: 18,
                          fontWeight: 700,
                          bgcolor:
                            r.decision === 'BLOCKED' ? '#3f1a1a' :
                            r.decision === 'PENDING' ? '#3f2a10' : '#1a3020',
                          color:
                            r.decision === 'BLOCKED' ? '#f87171' :
                            r.decision === 'PENDING' ? '#fb923c' : '#4ade80',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {r.decision === 'BLOCKED' && (
                        <Button
                          size="small"
                          onClick={() => navigate('/notifications')}
                          sx={{ fontSize: '11px', color: '#f87171', textTransform: 'none', px: 0.5, minWidth: 'unset' }}
                        >
                          Xem thông báo →
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </>
      )}
    </Box>
  )
}
