import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { usePageTitle } from '../hooks/usePageTitle'
import api from '../api'

function Profile() {
  const { user, logout, login, loaded } = useAuth()
  const navigate = useNavigate()
  const { bg, surface, border, text, textMuted } = useTheme()
  const [favorites, setFavorites] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const fileRef = useRef(null)
  usePageTitle('Mi perfil')

  useEffect(() => {
    if (!loaded) return
    if (!user) { navigate('/login'); return }
    loadData()
  }, [user, loaded])

  const loadData = async () => {
    setLoading(true)
    try {
      const [favsRes, commentsRes, meRes] = await Promise.all([
        api.get('/api/favorites'),
        api.get('/api/auth/me/comments'),
        api.get('/api/auth/me')
      ])
      setFavorites(favsRes.data)
      setComments(commentsRes.data)
      setProfile(meRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarLoading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.put('/api/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfile(prev => ({ ...prev, avatar_url: res.data.avatar_url }))
      login({ ...user, avatar_url: res.data.avatar_url }, localStorage.getItem('token'))
    } catch (err) {
      console.error(err)
    } finally {
      setAvatarLoading(false)
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
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 48px' }}>

        {/* Header perfil */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: 16,
          padding: '24px 20px',
          marginBottom: 16
        }}>
          {/* Avatar + info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #3b82f6' }}
                />
              ) : (
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: '#3b82f6', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 28, fontWeight: 700, color: 'white',
                  border: '3px solid rgba(255,255,255,0.2)'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarLoading}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: '#3b82f6', border: '2px solid #1e293b',
                  borderRadius: '50%', width: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 11
                }}
              >
                {avatarLoading ? '⏳' : '📷'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' }}
                onChange={handleAvatar}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ color: 'white', fontSize: 20, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </p>
              <span style={{
                display: 'inline-block',
                background: user.role === 'admin' ? '#fbbf24' : '#3b82f6',
                color: user.role === 'admin' ? '#1e293b' : 'white',
                fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 600
              }}>
                {user.role === 'admin' ? '⚙️ Admin' : '🌍 Explorador'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: '#ef4444', color: 'white', border: 'none',
                padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                flexShrink: 0, alignSelf: 'flex-start'
              }}
            >
              Salir
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6' }}>{favorites.length}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Favoritos</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{comments.length}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Comentarios</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>
                {new Date(profile?.created_at || Date.now()).getFullYear()}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Desde</div>
            </div>
          </div>
        </div>

        {loading && <p style={{ color: textMuted, textAlign: 'center', padding: 24 }}>Cargando...</p>}

        {/* Favoritos */}
        {!loading && (
          <div style={{ background: surface, borderRadius: 16, padding: '20px', marginBottom: 16, border: `1px solid ${border}` }}>
            <h2 style={{ fontSize: 15, marginBottom: 16, color: text }}>⭐ Favoritos ({favorites.length})</h2>

            {favorites.length === 0 && (
              <p style={{ color: textMuted, fontSize: 14 }}>
                Aún no tienes favoritos. <Link to="/" style={{ color: '#3b82f6' }}>Explora el mapa</Link>.
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
              {favorites.map(c => (
                <div key={c.code} style={{
                  background: bg,
                  borderRadius: 10,
                  border: `1px solid ${border}`,
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <Link to={`/country/${c.code}`} style={{ textDecoration: 'none' }}>
                    {c.flag_url && (
                      <img src={c.flag_url} alt={c.name} style={{ width: '100%', height: 55, objectFit: 'cover', display: 'block' }} />
                    )}
                    <div style={{ padding: '8px 10px' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                      <p style={{ fontSize: 11, color: textMuted, margin: '2px 0 0' }}>{c.region}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemoveFavorite(c.code)}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      background: 'rgba(239,68,68,0.85)', border: 'none',
                      color: 'white', width: 20, height: 20, borderRadius: '50%',
                      cursor: 'pointer', fontSize: 11, display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}
                  >✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comentarios */}
        {!loading && (
          <div style={{ background: surface, borderRadius: 16, padding: '20px', border: `1px solid ${border}` }}>
            <h2 style={{ fontSize: 15, marginBottom: 16, color: text }}>💬 Mis comentarios ({comments.length})</h2>

            {comments.length === 0 && (
              <p style={{ color: textMuted, fontSize: 14 }}>Aún no has comentado en ningún país.</p>
            )}

            {comments.map(c => (
              <div key={c.id} style={{ padding: '12px 0', borderBottom: `1px solid ${border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 4 }}>
                  <Link to={`/country/${c.country_code}`} style={{ fontSize: 13, fontWeight: 500, color: '#3b82f6', textDecoration: 'none' }}>
                    🌍 {c.country_name || c.country_code}
                  </Link>
                  <span style={{ fontSize: 11, color: textMuted }}>
                    {new Date(c.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: textMuted, margin: 0 }}>{c.content}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default Profile