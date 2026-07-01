import { useSocket } from '../hooks/useSocket'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import api from '../api'

const EMOJIS = ['❤️', '😂', '😮', '😢', '👏', '🔥']

function CommentItem({ comment, countryCode, onDelete, onReaction, onReply, depth = 0 }) {
  const { user } = useAuth()
  const { surface, border, text, textMuted, textSecondary, bg } = useTheme()
  const [showEmojis, setShowEmojis] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyImage, setReplyImage] = useState(null)
  const [replyLoading, setReplyLoading] = useState(false)
  const fileRef = useRef(null)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content || '')
  const [editLoading, setEditLoading] = useState(false)

  const handleReply = async () => {
    if (!replyText.trim() && !replyImage) return
    setReplyLoading(true)
    try {
      const formData = new FormData()
      formData.append('content', replyText)
      formData.append('parent_id', comment.id)
      if (replyImage) formData.append('image', replyImage)
      await api.post(`/api/comments/${countryCode}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setReplyText('')
      setReplyImage(null)
      setShowReply(false)
      onReply?.()
    } catch (err) {
      console.error(err)
    } finally {
      setReplyLoading(false)
    }
  }

  const timeAgo = (date) => {
    const d = new Date(date)
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (isNaN(diff)) return ''
    if (mins < 1) return 'ahora'
    if (mins < 60) return `hace ${mins}m`
    if (hours < 24) return `hace ${hours}h`
    if (days < 7) return `hace ${days}d`
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEdit = async () => {
    if (!editText.trim()) return
    setEditLoading(true)
    try {
      await api.put(`/api/comments/${comment.id}`, { content: editText })
      setEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div style={{ marginLeft: depth > 0 ? 32 : 0 }}>
      <div style={{
        background: depth > 0 ? bg : surface,
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 8,
        border: `1px solid ${border}`
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {comment.avatar_url ? (
              <img
                src={comment.avatar_url}
                alt={comment.user_name}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#3b82f6', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 600, flexShrink: 0
              }}>
                {comment.user_name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: text }}>{comment.user_name}</span>
            <span style={{ fontSize: 11, color: textMuted }}>{timeAgo(comment.created_at)}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {user?.id === comment.user_id && (
              <button
                onClick={() => setEditing(!editing)}
                style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 12 }}
              >
                ✏️
              </button>
            )}
            {(user?.id === comment.user_id || user?.role === 'admin') && (
              <button
                onClick={() => onDelete(comment.id)}
                style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 12 }}
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
      {/* Contenido */}
{editing ? (
  <div style={{ marginBottom: 8 }}>
    <textarea
      value={editText}
      onChange={e => setEditText(e.target.value)}
      rows={2}
      style={{
        width: '100%', padding: '8px 10px', borderRadius: 8,
        border: `1px solid ${border}`, fontSize: 14, resize: 'none',
        boxSizing: 'border-box', background: bg, color: text, fontFamily: 'inherit'
      }}
    />
    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
      <button
        onClick={handleEdit}
        disabled={editLoading}
        style={{ padding: '5px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
      >
        {editLoading ? 'Guardando...' : 'Guardar'}
      </button>
      <button
        onClick={() => { setEditing(false); setEditText(comment.content || '') }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: textMuted }}
      >
        Cancelar
      </button>
    </div>
  </div>
) : (
  comment.content && (
    <p style={{ fontSize: 14, color: textSecondary, margin: '0 0 8px', lineHeight: 1.6 }}>
      {comment.content}
      {comment.updated_at !== comment.created_at && (
        <span style={{ fontSize: 11, color: textMuted, marginLeft: 6 }}>(editado)</span>
      )}
    </p>
  )
)}

        {/* Imagen */}
        {comment.image_url && (
          <img
            src={comment.image_url}
            alt="imagen del comentario"
            style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 8, maxHeight: 300, objectFit: 'cover', display: 'block' }}
          />
        )}

        {/* Reacciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
          {comment.reactions?.map(r => (
            <button
              key={r.emoji}
              onClick={() => user && onReaction(comment.id, r.emoji)}
              style={{
                background: r.user_ids?.includes(user?.id) ? '#eff6ff' : bg,
                border: `1px solid ${r.user_ids?.includes(user?.id) ? '#bfdbfe' : border}`,
                borderRadius: 20,
                padding: '3px 8px',
                cursor: user ? 'pointer' : 'default',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              {r.emoji} <span style={{ fontSize: 12, color: textSecondary }}>{r.count}</span>
            </button>
          ))}

          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowEmojis(!showEmojis)}
                style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 20, padding: '3px 8px', cursor: 'pointer', fontSize: 13, color: textMuted }}
              >
                + 😊
              </button>
              {showEmojis && (
                <div style={{
                  position: 'absolute', bottom: '110%', left: 0, background: surface,
                  border: `1px solid ${border}`, borderRadius: 10, padding: '6px 8px',
                  display: 'flex', gap: 4, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => { onReaction(comment.id, e); setShowEmojis(false) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 2 }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {user && depth === 0 && (
            <button
              onClick={() => setShowReply(!showReply)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#3b82f6', marginLeft: 4 }}
            >
              💬 Responder
            </button>
          )}
        </div>

        {/* Formulario de respuesta */}
        {showReply && (
          <div style={{ marginTop: 10 }}>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Escribe tu respuesta..."
              rows={2}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 8,
                border: `1px solid ${border}`, fontSize: 13, resize: 'none',
                boxSizing: 'border-box', background: surface, color: text, fontFamily: 'inherit'
              }}
            />
            {replyImage && (
              <div style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>
                📎 {replyImage.name}
                <button onClick={() => setReplyImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', marginLeft: 6 }}>✕</button>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
              <button
                onClick={() => fileRef.current?.click()}
                style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 13, color: textMuted }}
              >
                📷
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setReplyImage(e.target.files[0])} />
              <button
                onClick={handleReply}
                disabled={replyLoading || (!replyText.trim() && !replyImage)}
                style={{ padding: '5px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
              >
                {replyLoading ? 'Enviando...' : 'Responder'}
              </button>
              <button
                onClick={() => setShowReply(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: textMuted }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Respuestas */}
      {comment.replies?.map(reply => (
        <CommentItem
          key={reply.id}
          comment={reply}
          countryCode={countryCode}
          onDelete={onDelete}
          onReaction={onReaction}
          depth={1}
        />
      ))}
    </div>
  )
}

function Comments({ countryCode }) {
  const { user } = useAuth()
  const { surface, border, text, textMuted, bg } = useTheme()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [sending, setSending] = useState(false)
  const fileRef = useRef(null)

  useSocket(countryCode, {
    onNewComment: (comment) => {
      if (!comment.parent_id) {
        setComments(prev => [comment, ...prev])
      } else {
        setComments(prev => prev.map(c =>
          c.id === comment.parent_id
            ? { ...c, replies: [...(c.replies || []), comment] }
            : c
        ))
      }
    },
    onDeleteComment: (id) => {
      setComments(prev => prev
        .filter(c => c.id !== id)
        .map(c => ({ ...c, replies: (c.replies || []).filter(r => r.id !== id) }))
      )
    },
    onEditComment: ({ id, content }) => {
      setComments(prev => prev.map(c => {
        if (c.id === id) return { ...c, content }
        return { ...c, replies: (c.replies || []).map(r => r.id === id ? { ...r, content } : r) }
      }))
    },
    onUpdateReactions: ({ comment_id, reactions }) => {
      setComments(prev => prev.map(c => {
        if (c.id === comment_id) return { ...c, reactions }
        return { ...c, replies: (c.replies || []).map(r => r.id === comment_id ? { ...r, reactions } : r) }
      }))
    }

  })

  useEffect(() => {
    loadComments()
  }, [countryCode])

  const loadComments = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/comments/${countryCode}`)
      setComments(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() && !image) return
    setSending(true)
    try {
      const formData = new FormData()
      formData.append('content', content)
      if (image) formData.append('image', image)
      await api.post(`/api/comments/${countryCode}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setContent('')
      setImage(null)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar comentario?')) return
    await api.delete(`/api/comments/${id}`)
  }

  const handleReaction = async (commentId, emoji) => {
    await api.post(`/api/comments/${commentId}/reactions`, { emoji })
  }

  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
        💬 Comentarios ({comments.length})
      </h3>

      {/* Formulario nuevo comentario */}
      {user ? (
        <div style={{ background: surface, borderRadius: 12, padding: '14px', marginBottom: 20, border: `1px solid ${border}` }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Escribe algo sobre este país..."
            rows={3}
            style={{
              width: '100%', padding: '8px 10px', borderRadius: 8,
              border: `1px solid ${border}`, fontSize: 14, resize: 'none',
              boxSizing: 'border-box', background: bg, color: text, fontFamily: 'inherit'
            }}
          />
          {image && (
            <div style={{ fontSize: 13, color: textMuted, marginTop: 6 }}>
              📎 {image.name}
              <button onClick={() => setImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', marginLeft: 6 }}>✕</button>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 14, color: textMuted, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              📷 Foto
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImage(e.target.files[0])} />
            <button
              onClick={handleSubmit}
              disabled={sending || (!content.trim() && !image)}
              style={{
                padding: '8px 20px', background: sending ? '#93c5fd' : '#3b82f6',
                color: 'white', border: 'none', borderRadius: 8, cursor: sending ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600
              }}
            >
              {sending ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      ) : (
        <p style={{ color: textMuted, fontSize: 13, marginBottom: 16 }}>
          <a href="/login" style={{ color: '#3b82f6' }}>Inicia sesión</a> para comentar.
        </p>
      )}

      {loading && <p style={{ color: textMuted, fontSize: 14 }}>Cargando comentarios...</p>}

      {!loading && comments.length === 0 && (
        <p style={{ color: textMuted, fontSize: 14 }}>Sin comentarios aún. ¡Sé el primero!</p>
      )}

      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          countryCode={countryCode}
          onDelete={handleDelete}
          onReaction={handleReaction}
          onReply={loadComments}
        />
      ))}
    </div>
  )
}

export { Comments }
export default Comments