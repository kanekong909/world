import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState, useRef } from 'react'
import SearchBox from './SearchBox'
import api from '../api'

function Navbar() {
  const { user, logout, darkMode, toggleDarkMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [countries, setCountries] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    api.get('/api/countries').then(res => setCountries(res.data))
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const isMap = location.pathname === '/map'
  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2000,
      background: 'rgba(38, 38, 38, 0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      padding: '12px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      {/* Fila superior: Logo + Buscador (desktop) + Acciones */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        width: '100%'
      }}>
        {/* Logo */}
        <Link 
          to="/map" 
          style={{
            color: '#1a1a1a',
            fontWeight: 700,
            fontSize: 'clamp(18px, 2vw, 22px)',
            textDecoration: 'none',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            letterSpacing: '-0.5px'
          }}
        >
          <span style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            WorldMap
          </span>
        </Link>

        {/* Buscador - Desktop */}
        {isMap && countries.length > 0 && (
          <div style={{
            flex: 1,
            maxWidth: '320px',
            display: 'block'
          }} className="search-desktop">
            <SearchBox countries={countries} />
          </div>
        )}

        {/* Acciones derecha */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginLeft: 'auto',
          flexShrink: 0
        }}>
          {/* Modo oscuro - Desktop */}
          <button
            onClick={toggleDarkMode}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              fontSize: 'clamp(18px, 1.2vw, 20px)',
              color: '#4a4a4a',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              opacity: 0.7
            }}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Botón menú hamburguesa - Mobile */}
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              fontSize: '22px',
              color: '#dfdfdf',
              transition: 'all 0.2s'
            }}
            className="mobile-menu-btn"
            aria-label="Menú"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Buscador - Mobile (debajo del título) */}
      {isMap && countries.length > 0 && (
        <div style={{
          width: '100%',
          display: 'none'
        }} className="search-mobile">
          <SearchBox countries={countries} />
        </div>
      )}

      {/* Menú móvil */}
      <div 
        ref={menuRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%'
        }}
        className="menu-container"
      >
        {user ? (
          <>
            <Link 
              to="/worldcup" 
              style={{
                color: isActive('/worldcup') ? '#2563eb' : '#d4d4d4',
                textDecoration: 'none',
                fontSize: 'clamp(13px, 1.2vw, 14px)',
                fontWeight: isActive('/worldcup') ? 600 : 400,
                padding: '8px 14px',
                borderRadius: '8px',
                transition: 'all 0.15s',
                background: isActive('/worldcup') ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>🏆</span> Mundial
            </Link>

            <Link 
              to="/stats" 
              style={{
                color: isActive('/stats') ? '#2563eb' : '#d3d2d2',
                textDecoration: 'none',
                fontSize: 'clamp(13px, 1.2vw, 14px)',
                fontWeight: isActive('/stats') ? 600 : 400,
                padding: '8px 14px',
                borderRadius: '8px',
                transition: 'all 0.15s',
                background: isActive('/stats') ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>📊</span> Stats
            </Link>

            {user.role === 'admin' && (
              <Link 
                to="/admin" 
                style={{
                  color: isActive('/admin') ? '#d97706' : '#d97706',
                  textDecoration: 'none',
                  fontSize: 'clamp(13px, 1.2vw, 14px)',
                  fontWeight: isActive('/admin') ? 600 : 400,
                  padding: '8px 14px',
                  borderRadius: '8px',
                  transition: 'all 0.15s',
                  background: isActive('/admin') ? 'rgba(217, 119, 6, 0.08)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                ⚡ Admin
              </Link>
            )}

            <div style={{
              width: 1,
              height: 24,
              background: 'rgba(0,0,0,0.08)',
              flexShrink: 0
            }} />

            <Link 
              to="/profile" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                padding: '4px 8px 4px 4px',
                borderRadius: '8px',
                transition: 'all 0.15s',
                background: isActive('/profile') ? 'rgba(37, 99, 235, 0.08)' : 'transparent'
              }}
            >
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt="avatar" 
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }} 
                />
              ) : (
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{
                color: '#c1c0c0',
                fontSize: 'clamp(13px, 1.2vw, 14px)',
                fontWeight: 500
              }}>
                {user.name}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                color: '#dc2626',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: 'clamp(12px, 1.2vw, 13px)',
                fontWeight: 500,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(220, 38, 38, 0.05)'
                e.target.style.borderColor = 'rgba(220, 38, 38, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.borderColor = 'rgba(220, 38, 38, 0.2)'
              }}
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              style={{
                color: '#4a4a4a',
                textDecoration: 'none',
                fontSize: 'clamp(13px, 1.2vw, 14px)',
                padding: '8px 14px',
                borderRadius: '8px',
                transition: 'all 0.15s',
                fontWeight: 400
              }}
            >
              Iniciar sesión
            </Link>
            <Link 
              to="/register" 
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                textDecoration: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                fontSize: 'clamp(13px, 1.2vw, 14px)',
                fontWeight: 500,
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.2)'
              }}
            >
              Registrarse
            </Link>
          </>
        )}
      </div>

      {/* Estilos responsive */}
      <style>{`
        @media (max-width: 768px) {
          nav {
            padding: 12px 16px !important;
            gap: 8px !important;
          }

          .mobile-menu-btn {
            display: flex !important;
          }

          .search-desktop {
            display: none !important;
          }

          .search-mobile {
            display: block !important;
          }

          .menu-container {
            display: ${mobileMenuOpen ? 'flex' : 'none'} !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 4px !important;
            padding-top: 8px !important;
            border-top: 1px solid rgba(0, 0, 0, 0.06) !important;
            margin-top: 4px !important;
          }

          .menu-container a,
          .menu-container button {
            width: 100% !important;
            justify-content: flex-start !important;
            padding: 10px 12px !important;
            border-radius: 8px !important;
          }

          .menu-container > div {
            display: none !important;
          }

          .menu-container a:hover {
            background: rgba(0, 0, 0, 0.04) !important;
          }
        }

        @media (min-width: 769px) {
          .menu-container {
            display: flex !important;
            flex-direction: row !important;
            justify-content: flex-start !important;
          }
        }

        @media (max-width: 480px) {
          nav {
            padding: 10px 12px !important;
          }

          .menu-container a,
          .menu-container button {
            font-size: 14px !important;
            padding: 8px 12px !important;
          }
        }
      `}</style>
    </nav>
  )
}

export default Navbar