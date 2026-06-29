import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { usePageTitle } from '../hooks/usePageTitle'
import api from '../api'

function Country() {
  usePageTitle(null)
  const { code } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { bg, surface, border, text, textMuted, textSecondary } = useTheme()

  const [country, setCountry] = useState(null)
  const [photos, setPhotos] = useState([])
  const [comments, setComments] = useState([])
  const [votes, setVotes] = useState(0)
  const [favorited, setFavorited] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadAll()
  }, [code])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [infoRes, photosRes, votesRes, commentsRes] = await Promise.all([
        api.get(`/api/countries/${code}`).catch(() => null),
        api.get(`/api/countries/${code}/photos`),
        api.get(`/api/interactions/${code}/votes`),
        api.get(`/api/interactions/${code}/comments`)
      ])
      if (infoRes) setCountry(infoRes.data)
      setPhotos(photosRes.data)
      setVotes(votesRes.data.total)
      setComments(commentsRes.data)

      if (user) {
        const favRes = await api.get(`/api/favorites/${code}`)
        setFavorited(favRes.data.favorited)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (value) => {
    if (!user) return
    await api.post(`/api/interactions/${code}/votes`, { value })
    const res = await api.get(`/api/interactions/${code}/votes`)
    setVotes(res.data.total)
  }

  const handleFavorite = async () => {
    if (!user) return
    const res = await api.post(`/api/favorites/${code}`)
    setFavorited(res.data.favorited)
  }

  const handleComment = async () => {
    if (!user || !newComment.trim()) return
    setCommentLoading(true)
    try {
      await api.post(`/api/interactions/${code}/comments`, { content: newComment })
      const res = await api.get(`/api/interactions/${code}/comments`)
      setComments(res.data)
      setNewComment('')
    } catch (err) {
      console.error(err)
    } finally {
      setCommentLoading(false)
    }
  }

  const styles = {
    page: {
      minHeight: '100vh',
      background: bg,
      paddingTop: 56
    },
    container: {
      maxWidth: 720,
      margin: '0 auto',
      padding: '24px 16px 48px'
    },
    backBtn: {
      background: 'none',
      border: 'none',
      color: textMuted,
      fontSize: 14,
      cursor: 'pointer',
      padding: '0 0 16px',
      display: 'block'
    },
    hero: {
      background: 'linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)',
      borderRadius: 16,
      padding: '24px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      marginBottom: 16,
      flexWrap: 'wrap'
    },
    flag: { width: 80, height: 54, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
    heroTitle: { fontSize: 26, fontWeight: 600, color: 'white', margin: '0 0 4px' },
    heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '0 0 10px' },
    badges: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    badge: { background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 12, padding: '3px 10px', borderRadius: 20 },
    actions: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' },
    votes: { display: 'flex', alignItems: 'center', gap: 10 },
    voteBtn: { background: surface, border: `1px solid ${border}`, borderRadius: 8, padding: '6px 14px', fontSize: 18, cursor: 'pointer' },
    voteScore: { fontSize: 18, fontWeight: 600 },
    actionBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid', fontSize: 14, cursor: 'pointer' },
    loginHint: { fontSize: 13, color: textMuted, marginBottom: 16 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 },
    stat: { background: surface, borderRadius: 12, padding: '14px 16px', border: `1px solid ${border}` },
    statIcon: { fontSize: 20, marginBottom: 4 },
    statLabel: { fontSize: 12, color: textMuted, marginBottom: 2 },
    statValue: { fontSize: 16, fontWeight: 600, color: text },
    section: { background: surface, borderRadius: 12, padding: '16px', marginBottom: 16, border: `1px solid ${border}` },
    sectionTitle: { fontSize: 12, fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 },
    desc: { fontSize: 15, color: textSecondary, lineHeight: 1.7, margin: 0 },
    wcBox: { background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, padding: '16px', marginBottom: 16 },
    wcTitle: { color: '#92400e', fontWeight: 600, fontSize: 14, marginBottom: 6 },
    wcText: { color: '#78350f', fontSize: 14, lineHeight: 1.6, margin: 0 },
    photosGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
    photo: { width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, cursor: 'pointer' },
    lightbox: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, cursor: 'pointer' },
    lightboxImg: { maxWidth: '100%', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain' },
    lightboxCaption: { color: 'white', fontSize: 14, marginTop: 12, textAlign: 'center' },
    textarea: { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${border}`, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', marginBottom: 8, fontFamily: 'inherit', background: surface, color: text },
    commentBtn: { padding: '8px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
    comment: { paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${border}` },
    commentHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
    commentAuthor: { fontSize: 13, color: text, fontWeight: 500 },
    commentDate: { fontSize: 11, color: textMuted },
    commentText: { fontSize: 14, color: textSecondary, margin: 0 }
  }

  if (loading) return (
    <div style={{ paddingTop: 80, textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
      Cargando...
    </div>
  )

  if (!country) return (
    <div style={{ paddingTop: 80, textAlign: 'center' }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>🌍</p>
      <h2 style={{ color: '#1e293b', marginBottom: 8 }}>País sin información aún</h2>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>El administrador aún no ha cargado datos para este país.</p>
      <button onClick={() => navigate('/')} style={styles.backBtn}>← Volver al mapa</button>
    </div>
  )

  return (
    <div style={styles.page}>

      {/* Lightbox */}
      {selectedPhoto && (
        <div onClick={() => setSelectedPhoto(null)} style={styles.lightbox}>
          <img src={selectedPhoto.url} alt={selectedPhoto.caption} style={styles.lightboxImg} />
          {selectedPhoto.caption && (
            <p style={styles.lightboxCaption}>{selectedPhoto.caption}</p>
          )}
        </div>
      )}

      <div style={styles.container}>

        {/* Botón volver */}
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← Volver al mapa
        </button>

        {/* Hero */}
        <div style={styles.hero}>
          {country.flag_url && (
            <img src={country.flag_url} alt={`Bandera de ${country.name}`} style={styles.flag} />
          )}
          <div>
            <h1 style={styles.heroTitle}>{country.name}</h1>
            <p style={styles.heroSub}>
              {[country.subregion, country.region].filter(Boolean).join(' · ')}
            </p>
            <div style={styles.badges}>
              {country.code && <span style={styles.badge}>{country.code}</span>}
              {country.languages && <span style={styles.badge}>{country.languages}</span>}
              {country.currency && <span style={styles.badge}>{country.currency}</span>}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div style={styles.actions}>
          <div style={styles.votes}>
            <button onClick={() => handleVote(1)} disabled={!user} style={styles.voteBtn}>👍</button>
            <span style={{ ...styles.voteScore, color: votes >= 0 ? '#16a34a' : '#dc2626' }}>
              {votes > 0 ? `+${votes}` : votes}
            </span>
            <button onClick={() => handleVote(-1)} disabled={!user} style={styles.voteBtn}>👎</button>
          </div>
          <button onClick={handleFavorite} disabled={!user} style={{
            ...styles.actionBtn,
            background: favorited ? '#fef3c7' : '#f8fafc',
            borderColor: favorited ? '#fcd34d' : '#e2e8f0',
            color: favorited ? '#92400e' : '#475569'
          }}>
            {favorited ? '⭐ Favorito' : '☆ Favorito'}
          </button>

          {/* Compartir pais */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: `1px solid ${border}`,
              background: surface,
              color: copied ? '#16a34a' : text,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {copied ? '✓ Copiado' : '🔗 Compartir'}
          </button>
        </div>

        {!user && (
          <p style={styles.loginHint}>
            <a href="/login" style={{ color: '#3b82f6' }}>Inicia sesión</a> para votar, comentar y guardar favoritos.
          </p>
        )}

        {/* Stats */}
        <div style={styles.statsGrid}>
          {country.capital && (
            <div style={styles.stat}>
              <div style={styles.statIcon}>🏙️</div>
              <div style={styles.statLabel}>Capital</div>
              <div style={styles.statValue}>{country.capital}</div>
            </div>
          )}
          {country.population && (
            <div style={styles.stat}>
              <div style={styles.statIcon}>👥</div>
              <div style={styles.statLabel}>Población</div>
              <div style={styles.statValue}>{Number(country.population).toLocaleString()}</div>
            </div>
          )}
          {country.area && (
            <div style={styles.stat}>
              <div style={styles.statIcon}>📐</div>
              <div style={styles.statLabel}>Área</div>
              <div style={styles.statValue}>{Number(country.area).toLocaleString()} km²</div>
            </div>
          )}
          <div style={styles.stat}>
            <div style={styles.statIcon}>💬</div>
            <div style={styles.statLabel}>Comentarios</div>
            <div style={styles.statValue}>{comments.length}</div>
          </div>
        </div>

        {/* Descripción */}
        {country.description && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Sobre el país</div>
            <p style={styles.desc}>{country.description}</p>
          </div>
        )}

        {/* Mundial */}
        {country.world_cup_info && (
          <div style={styles.wcBox}>
            <div style={styles.wcTitle}>🏆 Mundial 2026</div>
            <p style={styles.wcText}>{country.world_cup_info}</p>
          </div>
        )}

        {/* Galería */}
        {photos.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Galería</div>
            <div style={styles.photosGrid}>
              {photos.map(photo => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={photo.caption || country.name}
                  style={styles.photo}
                  onClick={() => setSelectedPhoto(photo)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Comentarios */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Comentarios ({comments.length})</div>

          {user && (
            <div style={{ marginBottom: 16 }}>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                rows={3}
                style={styles.textarea}
              />
              <button
                onClick={handleComment}
                disabled={commentLoading || !newComment.trim()}
                style={styles.commentBtn}
              >
                {commentLoading ? 'Enviando...' : 'Comentar'}
              </button>
            </div>
          )}

          {comments.length === 0 && (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>Sin comentarios aún. ¡Sé el primero!</p>
          )}

          {comments.map(c => (
            <div key={c.id} style={styles.comment}>
              <div style={styles.commentHeader}>
                <strong style={styles.commentAuthor}>{c.user_name}</strong>
                <span style={styles.commentDate}>
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={styles.commentText}>{c.content}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}


export default Country