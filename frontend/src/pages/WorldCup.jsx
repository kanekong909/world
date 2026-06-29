import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import CountryAutocomplete from '../components/CountryAutocomplete'
import { usePageTitle } from '../hooks/usePageTitle'
import api from '../api'

const stages = [
  { key: 'group', label: 'Fase de grupos' },
  { key: 'round16', label: 'Octavos' },
  { key: 'quarter', label: 'Cuartos' },
  { key: 'semi', label: 'Semifinales' },
  { key: 'final', label: 'Final' }
]

function WorldCup() {
  usePageTitle('Mundial 2026')
  const [activeTab, setActiveTab] = useState('groups')
  const [groups, setGroups] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [predictions, setPredictions] = useState([])
  const [myPrediction, setMyPrediction] = useState(null)
  const [predictionForm, setPredictionForm] = useState({ predicted_winner: '', predicted_winner_flag: '', predicted_winner_code: '' })
  const [predLoading, setPredLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [groupsRes, matchesRes, predsRes] = await Promise.all([
        api.get('/api/worldcup/groups'),
        api.get('/api/worldcup/matches'),
        api.get('/api/worldcup/predictions')
      ])
      setGroups(groupsRes.data)
      setMatches(matchesRes.data)
      setPredictions(predsRes.data)

      if (user) {
        const myPredRes = await api.get('/api/worldcup/predictions/me')
        setMyPrediction(myPredRes.data)
        if (myPredRes.data) {
          setPredictionForm({
            predicted_winner: myPredRes.data.predicted_winner,
            predicted_winner_flag: myPredRes.data.predicted_winner_flag,
            predicted_winner_code: myPredRes.data.predicted_winner_code
          })
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getMatchesByStage = (stage) => matches.filter(m => m.stage === stage)

  const formatDate = (date) => {
    if (!date) return 'Por confirmar'
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })
  }

  const handleSavePrediction = async () => {
    if (!predictionForm.predicted_winner) return
    setPredLoading(true)
    try {
      const res = await api.post('/api/worldcup/predictions', predictionForm)
      setMyPrediction(res.data)
      const predsRes = await api.get('/api/worldcup/predictions')
      setPredictions(predsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setPredLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', paddingTop: 56 }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
        padding: '32px 16px 24px',
        textAlign: 'center',
        borderBottom: '1px solid #1e293b'
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <h1 style={{ color: 'white', fontSize: 28, margin: '0 0 4px', fontWeight: 700 }}>Mundial 2026</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Estados Unidos · Canadá · México</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: 4,
        padding: '12px 16px',
        background: '#0f172a',
        borderBottom: '1px solid #1e293b'
      }}>
        {[{ key: 'groups', label: 'Grupos' }, ...stages, { key: 'predictions', label: '🔮 Predicciones' }].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeTab === tab.key ? 600 : 400,
              background: activeTab === tab.key ? '#3b82f6' : '#1e293b',
              color: activeTab === tab.key ? 'white' : '#64748b',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 48px' }}>

        {loading && <p style={{ color: '#64748b', textAlign: 'center' }}>Cargando...</p>}

        {/* TAB: Grupos */}
        {!loading && activeTab === 'groups' && (
          <>
            {groups.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>⚽</p>
                <p style={{ color: '#64748b', fontSize: 15 }}>Los grupos aún no han sido configurados.</p>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {groups.map(group => (
                <div key={group.id} style={{
                  background: '#1e293b',
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: '1px solid #334155'
                }}>
                  <div style={{
                    background: '#3b82f6',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <h3 style={{ color: 'white', fontSize: 15, margin: 0 }}>Grupo {group.name}</h3>
                  </div>

                  {/* Tabla del grupo */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #334155' }}>
                        <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 500, textAlign: 'left' }}>Equipo</th>
                        <th style={{ padding: '8px 6px', color: '#64748b', fontWeight: 500, textAlign: 'center' }}>PJ</th>
                        <th style={{ padding: '8px 6px', color: '#64748b', fontWeight: 500, textAlign: 'center' }}>G</th>
                        <th style={{ padding: '8px 6px', color: '#64748b', fontWeight: 500, textAlign: 'center' }}>E</th>
                        <th style={{ padding: '8px 6px', color: '#64748b', fontWeight: 500, textAlign: 'center' }}>P</th>
                        <th style={{ padding: '8px 6px', color: '#64748b', fontWeight: 500, textAlign: 'center' }}>GF</th>
                        <th style={{ padding: '8px 6px', color: '#64748b', fontWeight: 500, textAlign: 'center' }}>GA</th>
                        <th style={{ padding: '8px 10px', color: '#64748b', fontWeight: 500, textAlign: 'center' }}>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.teams.map((team, i) => (
                        <tr key={team.id} style={{
                          borderBottom: '1px solid #1e293b',
                          background: i < 2 ? 'rgba(59,130,246,0.08)' : 'transparent'
                        }}>
                          <td style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {i < 2 && <div style={{ width: 3, height: 16, background: '#3b82f6', borderRadius: 2, flexShrink: 0 }} />}
                            {team.flag_url && <img src={team.flag_url} alt={team.country_name} style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 2 }} />}
                            <span style={{ color: 'white', fontSize: 13 }}>{team.country_name}</span>
                          </td>
                          <td style={{ padding: '10px 6px', color: '#94a3b8', textAlign: 'center' }}>{team.played}</td>
                          <td style={{ padding: '10px 6px', color: '#94a3b8', textAlign: 'center' }}>{team.won}</td>
                          <td style={{ padding: '10px 6px', color: '#94a3b8', textAlign: 'center' }}>{team.drawn}</td>
                          <td style={{ padding: '10px 6px', color: '#94a3b8', textAlign: 'center' }}>{team.lost}</td>
                          <td style={{ padding: '10px 6px', color: '#94a3b8', textAlign: 'center' }}>{team.goals_for}</td>
                          <td style={{ padding: '10px 6px', color: '#94a3b8', textAlign: 'center' }}>{team.goals_against}</td>
                          <td style={{ padding: '10px 10px', color: 'white', fontWeight: 700, textAlign: 'center' }}>{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TAB: Partidos por fase */}
        {!loading && activeTab !== 'groups' && (
          <>
            {getMatchesByStage(activeTab).length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>⚽</p>
                <p style={{ color: '#64748b', fontSize: 15 }}>No hay partidos en esta fase aún.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {getMatchesByStage(activeTab).map(match => (
                <div key={match.id} style={{
                  background: '#1e293b',
                  borderRadius: 14,
                  padding: '16px',
                  border: '1px solid #334155'
                }}>
                  {/* Fecha y sede */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ color: '#64748b', fontSize: 12 }}>{formatDate(match.match_date)}</span>
                    {match.venue && <span style={{ color: '#64748b', fontSize: 12 }}>📍 {match.venue}</span>}
                  </div>

                  {/* Equipos y marcador */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    {/* Local */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      {match.home_flag && <img src={match.home_flag} alt={match.home_team} style={{ width: 28, height: 19, objectFit: 'cover', borderRadius: 3 }} />}
                      <span style={{ color: 'white', fontSize: 15, fontWeight: 500 }}>{match.home_team}</span>
                    </div>

                    {/* Marcador */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {match.status === 'finished' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 22, fontWeight: 700, color: 'white', minWidth: 24, textAlign: 'center' }}>{match.home_score}</span>
                          <span style={{ color: '#64748b', fontSize: 14 }}>—</span>
                          <span style={{ fontSize: 22, fontWeight: 700, color: 'white', minWidth: 24, textAlign: 'center' }}>{match.away_score}</span>
                        </div>
                      ) : match.status === 'live' ? (
                        <span style={{ background: '#ef4444', color: 'white', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                          EN VIVO
                        </span>
                      ) : (
                        <span style={{ color: '#475569', fontSize: 14, fontWeight: 500 }}>vs</span>
                      )}
                    </div>

                    {/* Visitante */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                      <span style={{ color: 'white', fontSize: 15, fontWeight: 500 }}>{match.away_team}</span>
                      {match.away_flag && <img src={match.away_flag} alt={match.away_team} style={{ width: 28, height: 19, objectFit: 'cover', borderRadius: 3 }} />}
                    </div>
                  </div>

                  {/* Estado */}
                  {match.status === 'finished' && (
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                      <span style={{ color: '#64748b', fontSize: 11 }}>Finalizado</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* TAB: Predicciones */}
        {!loading && activeTab === 'predictions' && (
          <div>
            {/* Mi predicción */}
            <div style={{
              background: '#1e293b',
              borderRadius: 14,
              padding: '20px',
              border: '1px solid #334155',
              marginBottom: 20
            }}>
              <h3 style={{ color: 'white', fontSize: 16, marginBottom: 4 }}>🔮 ¿Quién ganará el Mundial?</h3>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
                {myPrediction ? `Tu predicción actual: ${myPrediction.predicted_winner}` : 'Aún no has hecho tu predicción.'}
              </p>

              {user ? (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <CountryAutocomplete
                      value={predictionForm.predicted_winner}
                      onChange={(val) => setPredictionForm({ ...predictionForm, predicted_winner: val })}
                      onSelect={(country) => setPredictionForm({
                        predicted_winner: country.name,
                        predicted_winner_flag: country.flag_url || '',
                        predicted_winner_code: country.code
                      })}
                      placeholder="Busca tu campeón..."
                    />
                  </div>
                  {predictionForm.predicted_winner_flag && (
                    <img
                      src={predictionForm.predicted_winner_flag}
                      alt=""
                      style={{ width: 44, height: 30, objectFit: 'cover', borderRadius: 4 }}
                    />
                  )}
                  <button
                    onClick={handleSavePrediction}
                    disabled={predLoading || !predictionForm.predicted_winner}
                    style={{
                      padding: '9px 20px',
                      background: predLoading ? '#334155' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      cursor: predLoading ? 'not-allowed' : 'pointer',
                      fontSize: 14,
                      fontWeight: 600
                    }}
                  >
                    {predLoading ? 'Guardando...' : myPrediction ? 'Actualizar' : 'Predecir'}
                  </button>
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: 14 }}>
                  <a href="/login" style={{ color: '#3b82f6' }}>Inicia sesión</a> para hacer tu predicción.
                </p>
              )}
            </div>

            {/* Ranking de predicciones */}
            <div style={{
              background: '#1e293b',
              borderRadius: 14,
              border: '1px solid #334155',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155' }}>
                <h3 style={{ color: 'white', fontSize: 15, margin: 0 }}>Ranking de predicciones</h3>
              </div>

              {predictions.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: 14 }}>Nadie ha predicho aún. ¡Sé el primero!</p>
                </div>
              )}

              {predictions.map((p, i) => (
                <div key={p.predicted_winner} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  borderBottom: i < predictions.length - 1 ? '1px solid #0f172a' : 'none',
                  background: i === 0 ? 'rgba(251,191,36,0.08)' : 'transparent'
                }}>
                  <span style={{
                    fontSize: i === 0 ? 20 : 14,
                    fontWeight: 700,
                    color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c2f' : '#475569',
                    minWidth: 28,
                    textAlign: 'center'
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>

                  {p.predicted_winner_flag && (
                    <img src={p.predicted_winner_flag} alt={p.predicted_winner} style={{ width: 32, height: 22, objectFit: 'cover', borderRadius: 3 }} />
                  )}

                  <span style={{ color: 'white', fontSize: 15, flex: 1, fontWeight: i === 0 ? 600 : 400 }}>
                    {p.predicted_winner}
                  </span>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: i === 0 ? '#fbbf24' : '#64748b', fontSize: 18, fontWeight: 700 }}>
                      {p.total}
                    </div>
                    <div style={{ color: '#475569', fontSize: 11 }}>
                      {p.total === '1' ? 'voto' : 'votos'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorldCup