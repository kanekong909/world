import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import SearchBox from './SearchBox'
import { AuthProvider } from '../context/AuthContext'
import api from '../api'

function Navbar() {
  const { user, logout, darkMode, toggleDarkMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [countries, setCountries] = useState([])

  useEffect(() => {
    api.get('/api/countries').then(res => setCountries(res.data))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isMap = location.pathname === '/'

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2000,
      background: '#1e293b',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap'
    }}>
      <Link to="/" style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textDecoration: 'none', flexShrink: 0 }}>
        🌍 WorldMap
      </Link>

      {/* Buscador solo visible en el mapa */}
      {isMap && countries.length > 0 && (
        <div style={{ flex: 1, maxWidth: 320 }}>
          <SearchBox countries={countries} />
        </div>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {user ? (
          <>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: '#3b82f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 12, fontWeight: 600
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ color: '#94a3b8', fontSize: 14 }}>{user.name}</span>
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: 14 }}>
                Admin
              </Link>
            )}
            <Link to="/worldcup" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>
              🏆 Mundial
            </Link>
            <Link to="/stats" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>
              📊 Stats
            </Link>
            <button
              onClick={handleLogout}
              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>
              Iniciar sesión
            </Link>
            <Link to="/register" style={{ background: '#3b82f6', color: 'white', textDecoration: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 14 }}>
              Registrarse
            </Link>
          </>
        )}
      </div>

      <button
        onClick={toggleDarkMode}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: 8,
          padding: '6px 10px',
          cursor: 'pointer',
          fontSize: 16,
          color: 'white'
        }}
        title={darkMode ? 'Modo claro' : 'Modo oscuro'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </nav>
  )
}

export default Navbar