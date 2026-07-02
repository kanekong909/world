import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SearchBox({ countries }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { mapRef } = useAuth()

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = (e) => {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    const filtered = countries
      .filter(c => c.name.toLowerCase().includes(val.toLowerCase()))
      .slice(0, 6)
    setResults(filtered)
    setOpen(true)
  }

  const handleSelect = async (country) => {
    setQuery('')
    setResults([])
    setOpen(false)

    const isMap = location.pathname === '/map'

    if (isMap && mapRef.current) {
      // Busca las coordenadas del país en el GeoJSON
      try {
        const res = await fetch('/countries.geojson')
        const data = await res.json()
        const feature = data.features.find(f =>
          f.properties['ISO3166-1-Alpha-3'] === country.code ||
          f.properties.name === country.name
        )
        if (feature) {
          // Calcula el centro del país
          const bounds = getBounds(feature.geometry)
          if (bounds) {
            mapRef.current.flyToBounds(bounds, { padding: [60, 60], duration: 1.2 })
            return
          }
        }
      } catch (err) {
        console.error(err)
      }
    }

    navigate(`/country/${country.code}`)
  }

  const getBounds = (geometry) => {
    const coords = []
    const extract = (c) => {
      if (typeof c[0] === 'number') {
        coords.push([c[1], c[0]])
      } else {
        c.forEach(extract)
      }
    }
    try {
      if (geometry.type === 'Polygon') geometry.coordinates.forEach(extract)
      else if (geometry.type === 'MultiPolygon') geometry.coordinates.forEach(p => p.forEach(extract))
      if (coords.length === 0) return null
      const lats = coords.map(c => c[0])
      const lngs = coords.map(c => c[1])
      return [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]]
    } catch {
      return null
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 16,
          pointerEvents: 'none'
        }}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Buscar país..."
          style={{
            width: '100%',
            padding: '8px 12px 8px 34px',
            borderRadius: 10,
            border: 'none',
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            fontSize: 14,
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          right: 0,
          background: 'white',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 3000,
          overflow: 'hidden'
        }}>
          {results.map((c, i) => (
            <div
              key={c.code}
              onClick={() => handleSelect(c)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid #f1f5f9' : 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              {c.flag_url && (
                <img src={c.flag_url} alt={c.name} style={{ width: 28, height: 19, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
              )}
              <span style={{ fontSize: 14, color: '#1e293b' }}>{c.name}</span>
              <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{c.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBox