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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #272828 0%, #29292a 50%, #1a1a1a 100%)',
      paddingTop: 80,
      paddingBottom: 40
    }}>
      <div style={{ 
        maxWidth: 800, 
        margin: '0 auto', 
        padding: '0 20px'
      }}>
        {/* Tarjeta principal */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          overflow: 'hidden'
        }}>
          {/* Header del perfil */}
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            padding: 'clamp(24px, 4vw, 40px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decoración de fondo */}
            <div style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%)',
              borderRadius: '50%'
            }} />
            <div style={{
              position: 'absolute',
              bottom: -80,
              left: -30,
              width: 160,
              height: 160,
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08), transparent 70%)',
              borderRadius: '50%'
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(16px, 3vw, 24px)',
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 1
            }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 'clamp(72px, 10vw, 96px)',
                  height: 'clamp(72px, 10vw, 96px)',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  padding: '3px',
                  boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
                }}>
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="avatar"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        background: '#1e293b'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(32px, 4vw, 40px)',
                      fontWeight: 700,
                      color: 'white'
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={avatarLoading}
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    background: '#2563eb',
                    border: '3px solid #1e293b',
                    borderRadius: '50%',
                    width: 'clamp(28px, 3vw, 34px)',
                    height: 'clamp(28px, 3vw, 34px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 'clamp(12px, 1.2vw, 14px)',
                    color: 'white',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)'
                    e.target.style.background = '#1d4ed8'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)'
                    e.target.style.background = '#2563eb'
                  }}
                >
                  {avatarLoading ? '⏳' : '📷'}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    cursor: 'pointer'
                  }}
                  onChange={handleAvatar}
                />
              </div>

              {/* Información del usuario */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <h1 style={{
                  color: 'white',
                  fontSize: 'clamp(22px, 3vw, 28px)',
                  fontWeight: 700,
                  margin: '0 0 4px',
                  letterSpacing: '-0.01em'
                }}>
                  {user.name}
                </h1>
                <p style={{
                  color: '#94a3b8',
                  fontSize: 'clamp(13px, 1.2vw, 15px)',
                  margin: '0 0 10px'
                }}>
                  {user.email}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: user.role === 'admin' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    color: user.role === 'admin' ? '#fbbf24' : '#60a5fa',
                    fontSize: 'clamp(11px, 1vw, 12px)',
                    padding: '4px 14px',
                    borderRadius: 20,
                    fontWeight: 600
                  }}>
                    {user.role === 'admin' ? '⚙️ Admin' : '🌍 Explorador'}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#94a3b8',
                    fontSize: 'clamp(11px, 1vw, 12px)',
                    padding: '4px 14px',
                    borderRadius: 20
                  }}>
                    🗓️ Miembro desde {new Date(profile?.created_at || Date.now()).getFullYear()}
                  </span>
                </div>
              </div>

              {/* Botón salir */}
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  padding: 'clamp(8px, 1vw, 10px) clamp(16px, 2vw, 24px)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 'clamp(13px, 1.2vw, 14px)',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  alignSelf: 'flex-start'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.25)'
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.15)'
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)'
                }}
              >
                Salir
              </button>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '12px',
              marginTop: 'clamp(20px, 3vw, 28px)',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                padding: '14px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{
                  fontSize: 'clamp(24px, 3vw, 30px)',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #60a5fa, #93c5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {favorites.length}
                </div>
                <div style={{
                  fontSize: 'clamp(11px, 1vw, 12px)',
                  color: '#94a3b8',
                  marginTop: 2
                }}>
                  ⭐ Favoritos
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                padding: '14px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{
                  fontSize: 'clamp(24px, 3vw, 30px)',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #34d399, #6ee7b7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {comments.length}
                </div>
                <div style={{
                  fontSize: 'clamp(11px, 1vw, 12px)',
                  color: '#94a3b8',
                  marginTop: 2
                }}>
                  💬 Comentarios
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                padding: '14px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{
                  fontSize: 'clamp(24px, 3vw, 30px)',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #fbbf24, #fcd34d)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {favorites.length + comments.length}
                </div>
                <div style={{
                  fontSize: 'clamp(11px, 1vw, 12px)',
                  color: '#94a3b8',
                  marginTop: 2
                }}>
                  🎯 Total interacciones
                </div>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div style={{ padding: 'clamp(20px, 3vw, 32px)' }}>
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 0',
                gap: '12px'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: 20,
                  height: 20,
                  border: '2px solid rgba(37, 99, 235, 0.1)',
                  borderTopColor: '#2563eb',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span style={{ color: '#94a3b8', fontSize: 14 }}>
                  Cargando tu perfil...
                </span>
              </div>
            )}

            {!loading && (
              <>
                {/* Sección de favoritos */}
                <div style={{
                  marginBottom: 24
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16
                  }}>
                    <h2 style={{
                      fontSize: 'clamp(16px, 1.5vw, 18px)',
                      fontWeight: 600,
                      color: '#1a1a1a',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      ⭐ Favoritos
                      <span style={{
                        fontSize: 'clamp(12px, 1vw, 13px)',
                        color: '#94a3b8',
                        fontWeight: 400
                      }}>
                        ({favorites.length})
                      </span>
                    </h2>
                    {favorites.length > 0 && (
                      <Link
                        to="/map"
                        style={{
                          fontSize: 'clamp(12px, 1vw, 13px)',
                          color: '#2563eb',
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                      >
                        Ver todos →
                      </Link>
                    )}
                  </div>

                  {favorites.length === 0 && (
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.03)',
                      borderRadius: 12,
                      padding: '32px 20px',
                      textAlign: 'center',
                      border: '2px dashed rgba(59, 130, 246, 0.1)'
                    }}>
                      <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>🗺️</span>
                      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 8px' }}>
                        Aún no tienes países favoritos
                      </p>
                      <Link
                        to="/map"
                        style={{
                          color: '#2563eb',
                          textDecoration: 'none',
                          fontWeight: 500,
                          fontSize: 14
                        }}
                      >
                        Explora el mapa y guarda tus favoritos →
                      </Link>
                    </div>
                  )}

                  {favorites.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '12px'
                    }}>
                      {favorites.map(c => (
                        <div
                          key={c.code}
                          style={{
                            background: 'white',
                            borderRadius: 12,
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            position: 'relative',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'
                          }}
                        >
                          <Link
                            to={`/country/${c.code}`}
                            style={{ textDecoration: 'none' }}
                          >
                            {c.flag_url && (
                              <img
                                src={c.flag_url}
                                alt={c.name}
                                style={{
                                  width: '100%',
                                  height: 60,
                                  objectFit: 'cover',
                                  display: 'block'
                                }}
                              />
                            )}
                            <div style={{ padding: '10px 12px' }}>
                              <p style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#1a1a1a',
                                margin: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {c.name}
                              </p>
                              <p style={{
                                fontSize: 11,
                                color: '#94a3b8',
                                margin: '2px 0 0'
                              }}>
                                {c.region || 'País'}
                              </p>
                            </div>
                          </Link>
                          <button
                            onClick={() => handleRemoveFavorite(c.code)}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              background: 'rgba(239, 68, 68, 0.85)',
                              border: 'none',
                              color: 'white',
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              cursor: 'pointer',
                              fontSize: 12,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#dc2626'
                              e.target.style.transform = 'scale(1.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(239, 68, 68, 0.85)'
                              e.target.style.transform = 'scale(1)'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sección de comentarios */}
                <div>
                  <h2 style={{
                    fontSize: 'clamp(16px, 1.5vw, 18px)',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    margin: '0 0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    💬 Mis comentarios
                    <span style={{
                      fontSize: 'clamp(12px, 1vw, 13px)',
                      color: '#94a3b8',
                      fontWeight: 400
                    }}>
                      ({comments.length})
                    </span>
                  </h2>

                  {comments.length === 0 && (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.03)',
                      borderRadius: 12,
                      padding: '32px 20px',
                      textAlign: 'center',
                      border: '2px dashed rgba(16, 185, 129, 0.1)'
                    }}>
                      <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>💭</span>
                      <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                        Aún no has comentado en ningún país
                      </p>
                    </div>
                  )}

                  {comments.map((c, index) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '14px 16px',
                        borderBottom: index < comments.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.01)'
                        e.currentTarget.style.borderRadius = '8px'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.borderRadius = '0'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                        flexWrap: 'wrap',
                        gap: 4
                      }}>
                        <Link
                          to={`/country/${c.country_code}`}
                          style={{
                            fontSize: 'clamp(13px, 1.1vw, 14px)',
                            fontWeight: 500,
                            color: '#2563eb',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          🌍 {c.country_name || c.country_code}
                        </Link>
                        <span style={{
                          fontSize: 'clamp(11px, 1vw, 12px)',
                          color: '#94a3b8'
                        }}>
                          {new Date(c.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <p style={{
                        fontSize: 'clamp(13px, 1.1vw, 14px)',
                        color: '#475569',
                        margin: 0,
                        lineHeight: 1.6
                      }}>
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer del perfil */}
        <div style={{
          textAlign: 'center',
          marginTop: 24,
          padding: '16px',
          color: '#94a3b8',
          fontSize: 12
        }}>
          <p style={{ margin: 0 }}>
            🌍 WorldMap — Tu pasaporte digital al mundo
          </p>
        </div>
      </div>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .profile-card {
          animation: fadeIn 0.5s ease-out;
        }

        @media (max-width: 480px) {
          body {
            background: #f8fafc !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Profile