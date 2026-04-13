// Thanh lọc — tìm kiếm (debounce 300ms), chọn vai trò, chọn trạng thái

import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import { ROLES, ROLE_LABELS } from '../../../services/userService'

interface Props {
  search: string
  roleFilter: string
  statusFilter: string          // '' | 'active' | 'inactive'
  onSearchChange: (v: string) => void
  onRoleChange: (v: string) => void
  onStatusChange: (v: string) => void
}

export default function UserFilters({
  search, roleFilter, statusFilter,
  onSearchChange, onRoleChange, onStatusChange,
}: Props) {
  // Debounce 300ms cho ô tìm kiếm
  const [localSearch, setLocalSearch] = useState(search)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => { setLocalSearch(search) }, [search])

  const handleSearch = (v: string) => {
    setLocalSearch(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onSearchChange(v), 300)
  }

  // Dọn dẹp timer khi unmount
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
      {/* Tìm kiếm */}
      <TextField
        size="small"
        placeholder="Tìm theo email, họ tên..."
        value={localSearch}
        onChange={e => handleSearch(e.target.value)}
        sx={{ minWidth: 260 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
          ),
        }}
      />

      {/* Lọc theo vai trò */}
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Vai trò</InputLabel>
        <Select value={roleFilter} label="Vai trò" onChange={e => onRoleChange(e.target.value)}>
          <MenuItem value="">Tất cả</MenuItem>
          {ROLES.map(r => (
            <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Lọc theo trạng thái */}
      <FormControl size="small" sx={{ minWidth: 170 }}>
        <InputLabel>Trạng thái</InputLabel>
        <Select value={statusFilter} label="Trạng thái" onChange={e => onStatusChange(e.target.value)}>
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="active">Đang hoạt động</MenuItem>
          <MenuItem value="inactive">Đã vô hiệu hóa</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}
