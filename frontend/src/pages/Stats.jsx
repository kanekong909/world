import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { usePageTitle } from '../hooks/usePageTitle'
import api from '../api'

function Stats() {
  usePageTitle('Estadísticas')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { bg, surface, border, text, textMuted, textSecondary } = useTheme()

  useEffect(() => {
    api.get('/api/countries/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const StatCard = ({ emoji, label, value, accent }) => (
    <div style={{
      background: surface,
      borderRadius: 12,
      padding: '20px',
      border: `1px solid ${border}`,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent || '#3b82f6' }}>{value}</div>
      <div style={{ fontSize: 13, color: textMuted, marginTop: 4 }}>{label}</div>
    </div>
  )

  const RankingList = ({ title, emoji, items, valueKey, valueSuffix }) => (
    <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}` }}>
        <h3 style={{ fontSize: 15, margin: 0, color: text }}>{emoji} {title}</h3>
      </div>
      {items.map((item, i) => (
        <Link
          key={item.code}
          to={`/country/${item.code}`}
          style={{ textDecoration: 'none' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 20px',
            borderBottom: i < items.length - 1 ? `1px solid ${border}` : 'none',
            cursor: 'pointer',
            transition: 'background 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = bg}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{
              fontSize: i === 0 ? 20 : 14,
              fontWeight: 700,
              color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c2f' : textMuted,
              minWidth: 28,
              textAlign: 'center'
            }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
            </span>
            {item.flag_url && (
              <img src={item.flag_url} alt={item.name} style={{ width: 32, height: 22, objectFit: 'cover', borderRadius: 3 }} />
            )}
            <span style={{ flex: 1, fontSize: 14, color: text, fontWeight: i === 0 ? 600 : 400 }}>{item.name}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6' }}>
              {item[valueKey]} {valueSuffix}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: bg, paddingTop: 56 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 48px' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, color: text, margin: '0 0 4px' }}>📊 Estadísticas globales</h1>
          <p style={{ color: textMuted, fontSize: 14, margin: 0 }}>Descubre qué países son los más populares</p>
        </div>

        {loading && <p style={{ color: textMuted, textAlign: 'center' }}>Cargando...</p>}

        {!loading && stats && (
          <>
            {/* Totales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
              <StatCard emoji="🌍" label="Países en la app" value={stats.totalCountries} accent="#3b82f6" />
              <StatCard emoji="👥" label="Usuarios registrados" value={stats.totalUsers} accent="#10b981" />
              <StatCard emoji="⭐" label="País más favorito" value={stats.mostFavorited[0]?.name || '—'} accent="#f59e0b" />
              <StatCard emoji="💬" label="País más comentado" value={stats.mostCommented[0]?.name || '—'} accent="#8b5cf6" />
            </div>

            {/* Rankings */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              <div>
                <RankingList
                  title="Más votados"
                  emoji="👍"
                  items={stats.mostVoted}
                  valueKey="score"
                  valueSuffix="pts"
                />
              </div>
              <div>
                <RankingList
                  title="Más comentados"
                  emoji="💬"
                  items={stats.mostCommented}
                  valueKey="total"
                  valueSuffix="comentarios"
                />
              </div>
              <div>
                <RankingList
                  title="Más guardados"
                  emoji="⭐"
                  items={stats.mostFavorited}
                  valueKey="total"
                  valueSuffix="favoritos"
                />
              </div>
            </div>
          </>
        )}

        {!loading && stats && stats.totalCountries === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🌍</p>
            <p style={{ color: textMuted, fontSize: 15 }}>Aún no hay suficientes datos. ¡Agrega países desde el panel admin!</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default Stats