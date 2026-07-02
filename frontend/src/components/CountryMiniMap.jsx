import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'

function CountryMiniMap({ countryCode, countryName }) {
  const [feature, setFeature] = useState(null)
  const [bounds, setBounds] = useState(null)

  useEffect(() => {
    fetch('/countries.geojson')
      .then(res => res.json())
      .then(data => {
        const found = data.features.find(f =>
          f.properties['ISO3166-1-Alpha-3'] === countryCode ||
          f.properties.name === countryName
        )
        if (!found) return
        setFeature(found)
        setBounds(getFeatureBounds(found.geometry))
      })
  }, [countryCode])

  const getFeatureBounds = (geometry) => {
    const coords = []
    const extract = (c) => {
      if (typeof c[0] === 'number') coords.push([c[1], c[0]])
      else c.forEach(extract)
    }
    if (geometry.type === 'Polygon') geometry.coordinates.forEach(extract)
    else if (geometry.type === 'MultiPolygon') geometry.coordinates.forEach(p => p.forEach(extract))
    if (coords.length === 0) return null
    const lats = coords.map(c => c[0])
    const lngs = coords.map(c => c[1])
    return [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]]
  }

  if (!feature || !bounds) return (
    <div style={{
      height: 200,
      borderRadius: 10,
      background: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#94a3b8',
      fontSize: 14
    }}>
      Cargando mapa...
    </div>
  )

  return (
    <div style={{ height: 200, borderRadius: 10, overflow: 'hidden' }}>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [20, 20] }}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <GeoJSON
          data={feature}
          style={{
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
            color: '#1d4ed8',
            weight: 2
          }}
        />
      </MapContainer>
    </div>
  )
}

export default CountryMiniMap