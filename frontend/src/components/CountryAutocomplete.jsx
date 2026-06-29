import { useState, useEffect, useRef } from 'react'
import api from '../api'

function CountryAutocomplete({ value, onChange, onSelect, placeholder }) {
  const [countries, setCountries] = useState([])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const ref = useRef(null)

  useEffect(() => {
    api.get('/api/countries').then(res => setCountries(res.data))
  }, [])

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.code.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6)

  const handleChange = (e) => {
    setQuery(e.target.value)
    onChange(e.target.value)
    setOpen(true)
  }

  const handleSelect = (country) => {
    setQuery(country.name)
    setOpen(false)
    onSelect(country)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={handleChange}
        onFocus={() => query.length > 0 && setOpen(true)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '9px 12px',
          borderRadius: 8,
          border: '1px solid #334155',
          fontSize: 14,
          boxSizing: 'border-box',
          background: '#1e293b',
          color: 'white'
        }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          right: 0,
          background: 'white',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          {filtered.map((c, i) => (
            <div
              key={c.code}
              onClick={() => handleSelect(c)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                cursor: 'pointer',
                borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                background: 'white'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              {c.flag_url && <img src={c.flag_url} alt={c.name} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />}
              <span style={{ fontSize: 14, color: '#1e293b', flex: 1 }}>{c.name}</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CountryAutocomplete