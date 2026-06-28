import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2000,
      background: '#1e293b',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 24
    }}>
      <Link to="/" style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textDecoration: 'none' }}>
        🌍 WorldMap
      </Link>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        {user ? (
          <>
            <span style={{ color: '#94a3b8', fontSize: 14 }}>
              Hola, {user.name}
            </span>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: 14 }}>
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              style={{
                background: '#3b82f6',
                color: 'white',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 14
              }}
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar