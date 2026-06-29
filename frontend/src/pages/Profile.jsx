import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { useTheme } from '../hooks/useTheme'

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const { bg, surface, border, text, textMuted } = useTheme()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [favsRes, commentsRes] = await Promise.all([
        api.get('/api/favorites'),
        api.get('/api/auth/me/comments')
      ])
      setFavorites(favsRes.data)
      setComments(commentsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (code) => {
    await api.post(`/api/favorites/${code}`)
    setFavorites(favorites.filter(f => f.code !== code))
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: bg, paddingTop: 56 }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* Header perfil */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: 16,
          padding: '28px 24px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            color: 'white',
            flexShrink: 0
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: 'white', fontSize: 22, margin: '0 0 4px' }}>{user.name}</h1>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>{user.email}</p>
            <span style={{
              display: 'inline-block',
              marginTop: 8,
              background: user.role === 'admin' ? '#fbbf24' : '#3b82f6',
              color: user.role === 'admin' ? '#1e293b' : 'white',
              fontSize: 11,
              padding: '2px 10px',
              borderRadius: 20,
              fontWeight: 600
            }}>
              {user.role === 'admin' ? '⚙️ Admin' : '🌍 Explorador'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            Cerrar sesión
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{favorites.length}</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Favoritos</div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{comments.length}</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Comentarios</div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
              {new Date(user.created_at || Date.now()).getFullYear()}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Miembro desde</div>
          </div>
        </div>

        {loading && <p style={{ color: '#94a3b8', textAlign: 'center' }}>Cargando...</p>}

        {/* Favoritos */}
        {!loading && (
          <div style={{ background: 'white', borderRadius: 16, padding: '20px', marginBottom: 16, border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: 16, marginBottom: 16 }}>⭐ Países favoritos ({favorites.length})</h2>

            {favorites.length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: 14 }}>
                Aún no tienes favoritos. <Link to="/" style={{ color: '#3b82f6' }}>Explora el mapa</Link> y guarda los que más te gusten.
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {favorites.map(c => (
                <div key={c.code} style={{
                  background: '#f8fafc',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <Link to={`/country/${c.code}`} style={{ textDecoration: 'none' }}>
                    {c.flag_url && (
                      <img src={c.flag_url} alt={c.name} style={{ width: '100%', height: 60, objectFit: 'cover', display: 'block' }} />
                    )}
                    <div style={{ padding: '8px 10px' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', margin: 0 }}>{c.name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{c.region}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemoveFavorite(c.code)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'rgba(239,68,68,0.85)',
                      border: 'none',
                      color: 'white',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: 11,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comentarios */}
        {!loading && (
          <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: 16, marginBottom: 16 }}>💬 Mis comentarios ({comments.length})</h2>

            {comments.length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Aún no has comentado en ningún país.</p>
            )}

            {comments.map(c => (
              <div key={c.id} style={{
                padding: '12px 0',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 4 }}>
                  <Link to={`/country/${c.country_code}`} style={{ fontSize: 13, fontWeight: 500, color: '#3b82f6', textDecoration: 'none' }}>
                    🌍 {c.country_name || c.country_code}
                  </Link>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>{c.content}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default Profile