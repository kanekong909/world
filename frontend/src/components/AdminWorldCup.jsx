import { useState, useEffect, useRef } from 'react'
import api from '../api'

const CountryAutocomplete = ({ value, onChange, onSelect, placeholder }) => {
  const [countries, setCountries] = useState([])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const ref = useRef(null)

  useEffect(() => {
    api.get('/api/countries').then(res => setCountries(res.data))
  }, [])

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.code.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6)

  const handleChange = (e) => {
    setQuery(e.target.value)
    onChange(e.target.value)
    setOpen(true)
  }

  const handleSelect = (country) => {
    setQuery(country.name)
    setOpen(false)
    onSelect(country)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={handleChange}
        onFocus={() => query.length > 0 && setOpen(true)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '9px 12px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          fontSize: 14,
          boxSizing: 'border-box'
        }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          right: 0,
          background: 'white',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 9999,
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          {filtered.map((c, i) => (
            <div
              key={c.code}
              onClick={() => handleSelect(c)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                cursor: 'pointer',
                borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                background: 'white'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              {c.flag_url && <img src={c.flag_url} alt={c.name} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />}
              <span style={{ fontSize: 14, color: '#1e293b', flex: 1 }}>{c.name}</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminWorldCup() {
  const [groups, setGroups] = useState([])
  const [matches, setMatches] = useState([])
  const [activeSection, setActiveSection] = useState('groups')
  const [groupForm, setGroupForm] = useState({ name: '' })
  const [teamForm, setTeamForm] = useState({ group_id: '', country_name: '', country_code: '', flag_url: '' })
  const [matchForm, setMatchForm] = useState({
    group_id: '', stage: 'group',
    home_team: '', home_flag: '', home_code: '',
    away_team: '', away_flag: '', away_code: '',
    match_date: '', venue: ''
  })
  const [scoreForm, setScoreForm] = useState({})
  const [message, setMessage] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [g, m] = await Promise.all([
      api.get('/api/worldcup/groups'),
      api.get('/api/worldcup/matches')
    ])
    setGroups(g.data)
    setMatches(m.data)
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    await api.post('/api/worldcup/groups', groupForm)
    setGroupForm({ name: '' })
    loadData()
    showMessage('Grupo creado')
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    await api.post('/api/worldcup/teams', teamForm)
    setTeamForm({ group_id: '', country_name: '', country_code: '', flag_url: '' })
    loadData()
    showMessage('Equipo agregado')
  }

  const handleCreateMatch = async (e) => {
    e.preventDefault()
    await api.post('/api/worldcup/matches', {
      group_id: matchForm.group_id || null,
      stage: matchForm.stage,
      home_team: matchForm.home_team,
      away_team: matchForm.away_team,
      home_flag: matchForm.home_flag,
      away_flag: matchForm.away_flag,
      match_date: matchForm.match_date,
      venue: matchForm.venue
    })
    setMatchForm({
      group_id: '', stage: 'group',
      home_team: '', home_flag: '', home_code: '',
      away_team: '', away_flag: '', away_code: '',
      match_date: '', venue: ''
    })
    loadData()
    showMessage('Partido creado')
  }

  const handleUpdateScore = async (matchId) => {
    const score = scoreForm[matchId]
    if (!score) return
    await api.put(`/api/worldcup/matches/${matchId}`, {
      home_score: parseInt(score.home),
      away_score: parseInt(score.away),
      status: 'finished'
    })
    loadData()
    showMessage('Resultado actualizado')
  }

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    fontSize: 14,
    boxSizing: 'border-box'
  }

  const sections = ['groups', 'teams', 'matches', 'scores']
  const sectionLabels = { groups: 'Grupos', teams: 'Equipos', matches: 'Partidos', scores: 'Resultados' }

  return (
    <div>
      {message && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14,
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#16a34a' : '#dc2626'
        }}>
          {message.text}
        </div>
      )}

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {sections.map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            style={{
              padding: '7px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13,
              background: activeSection === s ? '#1e293b' : 'white',
              color: activeSection === s ? 'white' : '#475569',
              fontWeight: activeSection === s ? 600 : 400
            }}
          >
            {sectionLabels[s]}
          </button>
        ))}
      </div>

      {/* Grupos */}
      {activeSection === 'groups' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Crear grupo</h3>
          <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              placeholder="Nombre del grupo (ej: A)"
              value={groupForm.name}
              onChange={e => setGroupForm({ name: e.target.value })}
              required
              style={{ ...inputStyle, flex: 1, minWidth: 160 }}
            />
            <button type="submit" style={{ padding: '9px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
              Crear
            </button>
          </form>
          <div style={{ marginTop: 20 }}>
            {groups.map(g => (
              <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>Grupo {g.name}</span>
                <button onClick={async () => { await api.delete(`/api/worldcup/groups/${g.id}`); loadData() }}
                  style={{ padding: '4px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#dc2626' }}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipos */}
      {activeSection === 'teams' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Agregar equipo</h3>
          <form onSubmit={handleCreateTeam}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Grupo</label>
                <select value={teamForm.group_id} onChange={e => setTeamForm({ ...teamForm, group_id: e.target.value })} required style={inputStyle}>
                  <option value="">-- Selecciona --</option>
                  {groups.map(g => <option key={g.id} value={g.id}>Grupo {g.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>País</label>
                <CountryAutocomplete
                  value={teamForm.country_name}
                  onChange={(val) => setTeamForm({ ...teamForm, country_name: val })}
                  onSelect={(country) => setTeamForm({
                    ...teamForm,
                    country_name: country.name,
                    country_code: country.code,
                    flag_url: country.flag_url || `https://flagcdn.com/w320/${country.code.toLowerCase().slice(0, 2)}.png`
                  })}
                  placeholder="Buscar país..."
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Código ISO</label>
                <input
                  placeholder="Se llena automático"
                  value={teamForm.country_code}
                  onChange={e => setTeamForm({ ...teamForm, country_code: e.target.value })}
                  style={{ ...inputStyle, background: '#f8fafc' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>URL bandera</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {teamForm.flag_url && <img src={teamForm.flag_url} alt="" style={{ width: 32, height: 22, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />}
                  <input
                    placeholder="Se llena automático"
                    value={teamForm.flag_url}
                    onChange={e => setTeamForm({ ...teamForm, flag_url: e.target.value })}
                    style={{ ...inputStyle, background: '#f8fafc' }}
                  />
                </div>
              </div>
            </div>
            <button type="submit" style={{ marginTop: 16, padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Agregar equipo
            </button>
          </form>

          {/* Lista equipos */}
          <div style={{ marginTop: 24 }}>
            {groups.map(g => g.teams?.length > 0 && (
              <div key={g.id} style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Grupo {g.name}</h4>
                {g.teams.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    {t.flag_url && <img src={t.flag_url} alt={t.country_name} style={{ width: 28, height: 19, objectFit: 'cover', borderRadius: 2 }} />}
                    <span style={{ fontSize: 14, flex: 1 }}>{t.country_name}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{t.country_code}</span>
                    <button onClick={async () => { await api.delete(`/api/worldcup/teams/${t.id}`); loadData() }}
                      style={{ padding: '4px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#dc2626' }}>
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partidos */}
      {activeSection === 'matches' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Crear partido</h3>
          <form onSubmit={handleCreateMatch}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Fase</label>
                <select value={matchForm.stage} onChange={e => setMatchForm({ ...matchForm, stage: e.target.value })} style={inputStyle}>
                  <option value="group">Fase de grupos</option>
                  <option value="round16">Octavos</option>
                  <option value="quarter">Cuartos</option>
                  <option value="semi">Semifinales</option>
                  <option value="final">Final</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Grupo (opcional)</label>
                <select value={matchForm.group_id} onChange={e => setMatchForm({ ...matchForm, group_id: e.target.value })} style={inputStyle}>
                  <option value="">-- Ninguno --</option>
                  {groups.map(g => <option key={g.id} value={g.id}>Grupo {g.name}</option>)}
                </select>
              </div>

              {/* Local */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Equipo local</label>
                <CountryAutocomplete
                  value={matchForm.home_team}
                  onChange={(val) => setMatchForm({ ...matchForm, home_team: val })}
                  onSelect={(country) => setMatchForm({
                    ...matchForm,
                    home_team: country.name,
                    home_flag: country.flag_url || '',
                    home_code: country.code
                  })}
                  placeholder="Buscar equipo local..."
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Bandera local</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {matchForm.home_flag && <img src={matchForm.home_flag} alt="" style={{ width: 32, height: 22, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />}
                  <input value={matchForm.home_flag} onChange={e => setMatchForm({ ...matchForm, home_flag: e.target.value })} placeholder="Se llena automático" style={{ ...inputStyle, background: '#f8fafc' }} />
                </div>
              </div>

              {/* Visitante */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Equipo visitante</label>
                <CountryAutocomplete
                  value={matchForm.away_team}
                  onChange={(val) => setMatchForm({ ...matchForm, away_team: val })}
                  onSelect={(country) => setMatchForm({
                    ...matchForm,
                    away_team: country.name,
                    away_flag: country.flag_url || '',
                    away_code: country.code
                  })}
                  placeholder="Buscar equipo visitante..."
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Bandera visitante</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {matchForm.away_flag && <img src={matchForm.away_flag} alt="" style={{ width: 32, height: 22, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />}
                  <input value={matchForm.away_flag} onChange={e => setMatchForm({ ...matchForm, away_flag: e.target.value })} placeholder="Se llena automático" style={{ ...inputStyle, background: '#f8fafc' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Fecha y hora</label>
                <input type="datetime-local" value={matchForm.match_date} onChange={e => setMatchForm({ ...matchForm, match_date: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Sede</label>
                <input placeholder="Ej: MetLife Stadium" value={matchForm.venue} onChange={e => setMatchForm({ ...matchForm, venue: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <button type="submit" style={{ marginTop: 16, padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Crear partido
            </button>
          </form>
        </div>
      )}

      {/* Resultados */}
      {activeSection === 'scores' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Actualizar resultados</h3>
          {matches.length === 0 && <p style={{ color: '#94a3b8', fontSize: 14 }}>No hay partidos creados aún.</p>}
          {matches.map(m => (
            <div key={m.id} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{ fontSize: 14, flex: 1, fontWeight: 500 }}>
                  {m.home_team} vs {m.away_team}
                </span>
                {m.status === 'finished' && (
                  <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                    {m.home_score} — {m.away_score} ✓
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="number" min="0" placeholder="Local"
                  value={scoreForm[m.id]?.home || ''}
                  onChange={e => setScoreForm({ ...scoreForm, [m.id]: { ...scoreForm[m.id], home: e.target.value } })}
                  style={{ width: 70, padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14 }}
                />
                <span style={{ color: '#94a3b8' }}>—</span>
                <input type="number" min="0" placeholder="Visit."
                  value={scoreForm[m.id]?.away || ''}
                  onChange={e => setScoreForm({ ...scoreForm, [m.id]: { ...scoreForm[m.id], away: e.target.value } })}
                  style={{ width: 70, padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14 }}
                />
                <button onClick={() => handleUpdateScore(m.id)}
                  style={{ padding: '6px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  Guardar
                </button>
                <button onClick={async () => { await api.delete(`/api/worldcup/matches/${m.id}`); loadData() }}
                  style={{ padding: '6px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#dc2626' }}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminWorldCup