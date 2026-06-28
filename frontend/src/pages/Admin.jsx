import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const emptyForm = {
  code: '',
  name: '',
  capital: '',
  population: '',
  area: '',
  region: '',
  subregion: '',
  languages: '',
  currency: '',
  flag_url: '',
  description: '',
  world_cup_info: ''
}

const tabs = ['Países', 'Fotos']

function Admin() {
  const [activeTab, setActiveTab] = useState('Países')
  const [countries, setCountries] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const [selectedCountryForPhotos, setSelectedCountryForPhotos] = useState('')
  const [photos, setPhotos] = useState([])
  const [photoForm, setPhotoForm] = useState({ url: '', caption: '' })
  const [photoLoading, setPhotoLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => { loadCountries() }, [])

  useEffect(() => {
    if (selectedCountryForPhotos) loadPhotos(selectedCountryForPhotos)
  }, [selectedCountryForPhotos])

  const loadCountries = async () => {
    const res = await api.get('/api/countries')
    setCountries(res.data)
  }

  const loadPhotos = async (code) => {
    const res = await api.get(`/api/countries/${code}/photos`)
    setPhotos(res.data)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      if (editing) {
        await api.put(`/api/countries/${editing}`, form)
        setMessage({ type: 'success', text: 'País actualizado correctamente' })
      } else {
        await api.post('/api/countries', form)
        setMessage({ type: 'success', text: 'País creado correctamente' })
      }
      setForm(emptyForm)
      setEditing(null)
      loadCountries()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al guardar' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (country) => {
    try {
      const res = await api.get(`/api/countries/${country.code}`)
      const c = res.data
      setEditing(c.code)
      setForm({
        code: c.code,
        name: c.name || '',
        capital: c.capital || '',
        population: c.population || '',
        area: c.area || '',
        region: c.region || '',
        subregion: c.subregion || '',
        languages: c.languages || '',
        currency: c.currency || '',
        flag_url: c.flag_url || '',
        description: c.description || '',
        world_cup_info: c.world_cup_info || ''
      })
      setActiveTab('Países')
      setMessage(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (code) => {
    if (!confirm(`¿Eliminar ${code}?`)) return
    await api.delete(`/api/countries/${code}`)
    loadCountries()
  }

  const handleCancel = () => {
    setForm(emptyForm)
    setEditing(null)
    setMessage(null)
  }

  const handleAddPhoto = async (e) => {
    e.preventDefault()
    if (!selectedCountryForPhotos || !photoForm.url.trim()) return
    setPhotoLoading(true)
    try {
      await api.post(`/api/countries/${selectedCountryForPhotos}/photos`, photoForm)
      setPhotoForm({ url: '', caption: '' })
      loadPhotos(selectedCountryForPhotos)
    } catch (err) {
      console.error(err)
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleDeletePhoto = async (id) => {
    if (!confirm('¿Eliminar esta foto?')) return
    await api.delete(`/api/countries/photos/${id}`)
    loadPhotos(selectedCountryForPhotos)
  }

  const fields = [
    { name: 'code', label: 'Código ISO (ej: COL)', disabled: !!editing },
    { name: 'name', label: 'Nombre del país' },
    { name: 'capital', label: 'Capital' },
    { name: 'population', label: 'Población', type: 'number' },
    { name: 'area', label: 'Área (km²)', type: 'number' },
    { name: 'region', label: 'Región' },
    { name: 'subregion', label: 'Subregión' },
    { name: 'languages', label: 'Idiomas' },
    { name: 'currency', label: 'Moneda' },
    { name: 'flag_url', label: 'URL de la bandera' },
  ]

  return (
    <div style={{ paddingTop: 56, minHeight: '100vh', background: '#f1f5f9' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 48px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, margin: 0 }}>⚙️ Panel Admin</h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>Gestiona países y fotos</p>
          </div>
          <button onClick={() => navigate('/')} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#475569' }}>
            ← Volver al mapa
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', padding: 4, borderRadius: 10, border: '1px solid #e2e8f0' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: activeTab === tab ? 600 : 400,
                background: activeTab === tab ? '#3b82f6' : 'transparent',
                color: activeTab === tab ? 'white' : '#64748b'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB: Países */}
        {activeTab === 'Países' && (
          <>
            <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 24, border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: 16, marginBottom: 20 }}>
                {editing ? `✏️ Editando: ${editing}` : '➕ Agregar país'}
              </h2>

              {message && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 14,
                  background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: message.type === 'success' ? '#16a34a' : '#dc2626'
                }}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  {fields.map(f => (
                    <div key={f.name}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>
                        {f.label}
                      </label>
                      <input
                        type={f.type || 'text'}
                        name={f.name}
                        value={form[f.name]}
                        onChange={handleChange}
                        disabled={f.disabled}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          fontSize: 14,
                          boxSizing: 'border-box',
                          background: f.disabled ? '#f8fafc' : 'white'
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>Descripción</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>🏆 Info del Mundial</label>
                  <textarea
                    name="world_cup_info"
                    value={form.world_cup_info}
                    onChange={handleChange}
                    rows={2}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '10px 24px', background: loading ? '#93c5fd' : '#3b82f6', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
                  >
                    {loading ? 'Guardando...' : editing ? 'Actualizar' : 'Crear país'}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      style={{ padding: '10px 24px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista países */}
            <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: 16, marginBottom: 16 }}>📋 Países cargados ({countries.length})</h2>
              {countries.length === 0 && <p style={{ color: '#94a3b8', fontSize: 14 }}>No hay países aún.</p>}
              {countries.map(c => (
                <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                  {c.flag_url && <img src={c.flag_url} alt={c.name} style={{ width: 36, height: 24, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <strong style={{ fontSize: 14 }}>{c.name}</strong>
                    <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 8 }}>{c.code}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setActiveTab('Fotos'); setSelectedCountryForPhotos(c.code) }} style={{ padding: '5px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#16a34a' }}>
                      Fotos
                    </button>
                    <button onClick={() => handleEdit(c)} style={{ padding: '5px 10px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#0369a1' }}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(c.code)} style={{ padding: '5px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#dc2626' }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TAB: Fotos */}
        {activeTab === 'Fotos' && (
          <>
            <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 24, border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: 16, marginBottom: 16 }}>🖼️ Gestionar fotos</h2>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>Selecciona un país</label>
                <select
                  value={selectedCountryForPhotos}
                  onChange={e => setSelectedCountryForPhotos(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
                >
                  <option value="">-- Selecciona --</option>
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              {selectedCountryForPhotos && (
                <form onSubmit={handleAddPhoto}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>URL de la foto</label>
                      <input
                        type="url"
                        value={photoForm.url}
                        onChange={e => setPhotoForm({ ...photoForm, url: e.target.value })}
                        placeholder="https://..."
                        required
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>Descripción (opcional)</label>
                    <input
                      type="text"
                      value={photoForm.caption}
                      onChange={e => setPhotoForm({ ...photoForm, caption: e.target.value })}
                      placeholder="Ej: Vista del centro histórico"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={photoLoading}
                    style={{ marginTop: 12, padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {photoLoading ? 'Agregando...' : '+ Agregar foto'}
                  </button>
                </form>
              )}
            </div>

            {/* Grid de fotos */}
            {selectedCountryForPhotos && (
              <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: 16, marginBottom: 16 }}>Fotos ({photos.length})</h2>
                {photos.length === 0 && <p style={{ color: '#94a3b8', fontSize: 14 }}>No hay fotos aún para este país.</p>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                  {photos.map(p => (
                    <div key={p.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <img src={p.url} alt={p.caption} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                      {p.caption && (
                        <div style={{ padding: '6px 8px', fontSize: 11, color: '#64748b', background: '#f8fafc' }}>
                          {p.caption}
                        </div>
                      )}
                      <button
                        onClick={() => handleDeletePhoto(p.id)}
                        style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239,68,68,0.9)', border: 'none', color: 'white', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

export default Admin