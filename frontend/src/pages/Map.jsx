import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMapEvents, useMap } from "react-leaflet";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api";

function MapStateKeeper({ mapStateRef }) {
  useMapEvents({
    moveend: (e) => {
      mapStateRef.current = {
        center: [e.target.getCenter().lat, e.target.getCenter().lng],
        zoom: e.target.getZoom()
      }
    },
    zoomend: (e) => {
      mapStateRef.current = {
        center: [e.target.getCenter().lat, e.target.getCenter().lng],
        zoom: e.target.getZoom()
      }
    }
  })
  return null
}

function MapRefKeeper({ mapRef }) {
  const map = useMap()
  useEffect(() => {
    mapRef.current = map
  }, [map])
  return null
}

const nameToCode = {
  'France': 'FRA',
  'Norway': 'NOR',
  'French Guiana': 'GUF',
  'Northern Cyprus': 'CYP',
  'Somaliland': 'SOM',
  'Kosovo': 'XKX',
  'Dhekelia Sovereign Base Area': 'GBR',
  'US Naval Base Guantanamo Bay': 'USA',
  'Brazilian Island': 'BRA',
  'Cyprus No Mans Area': 'CYP',
  'Siachen Glacier': 'IND',
  'Baykonur Cosmodrome': 'KAZ',
  'Akrotiri Sovereign Base Area': 'GBR',
  'Southern Patagonian Ice Field': 'ARG',
  'Bir Tawil': 'default',
  'Indian Ocean Territories': 'AUS',
  'Coral Sea Islands': 'AUS',
  'Spratly Islands': 'default',
  'Clipperton Island': 'FRA',
  'Ashmore and Cartier Islands': 'AUS',
  'Bajo Nuevo Bank (Petrel Is.)': 'default',
  'Serranilla Bank': 'default',
  'Scarborough Reef': 'default'
}

const getCode = (feature) => {
  const code = feature.properties['ISO3166-1-Alpha-3']
  if (code && code !== '-99') return code
  return nameToCode[feature.properties.name] || 'default'
}

const countryRegions = {
  Africa: ['DZA','AGO','BEN','BWA','BFA','BDI','CMR','CPV','CAF','TCD','COM','COD','COG','CIV','DJI','EGY','GNQ','ERI','ETH','GAB','GMB','GHA','GIN','GNB','KEN','LSO','LBR','LBY','MDG','MWI','MLI','MRT','MUS','MAR','MOZ','NAM','NER','NGA','RWA','STP','SEN','SLE','SOM','ZAF','SSD','SDN','SWZ','TZA','TGO','TUN','UGA','ZMB','ZWE','SHN','REU','MYT','ESH'],
  Europe: ['ALB','AND','AUT','BLR','BEL','BIH','BGR','HRV','CYP','CZE','DNK','EST','FIN','FR','DEU','GRC','HUN','ISL','IRL','ITA','XKX','LVA','LIE','LTU','LUX','MLT','MDA','MCO','MNE','NLD','MKD','NOR','POL','PRT','ROU','RUS','SMR','SRB','SVK','SVN','ESP','SWE','CHE','UKR','GBR','VAT','GIB','FRO','GGY','IMN','JEY','ALA','SJM'],
  Asia: ['AFG','ARM','AZE','BHR','BGD','BTN','BRN','KHM','CHN','CYP','GEO','IND','IDN','IRN','IRQ','ISR','JPN','JOR','KAZ','KWT','KGZ','LAO','LBN','MYS','MDV','MNG','MMR','NPL','PRK','OMN','PAK','PSE','PHL','QAT','SAU','SGP','KOR','LKA','SYR','TWN','TJK','THA','TLS','TUR','TKM','ARE','UZB','VNM','YEM'],
  Americas: ['ATG','ARG','BHS','BRB','BLZ','BOL','BRA','CAN','CHL','COL','CRI','CUB','DMA','DOM','ECU','SLV','GRD','GTM','GUY','HTI','HND','JAM','MEX','NIC','PAN','PRY','PER','KNA','LCA','VCT','SUR','TTO','USA','URY','VEN','GUF','GLP','MTQ','PRI','VIR','CUW','ABW','SXM','BLM','MAF', 'BRA', 'GRL'],
  Oceania: ['AUS','FJI','KIR','MHL','FSM','NRU','NZL','PLW','PNG','WSM','SLB','TON','TUV','VUT','NCL','PYF','GUM','ASM','COK','NIU','NFK','MNP','TKL','WLF']
}

const getRegionByCode = (code) => {
  for (const [region, codes] of Object.entries(countryRegions)) {
    if (codes.includes(code)) return region
  }
  return 'default'
}

const regionColors = {
  Africa: { fill: '#f59e0b', border: '#d97706' },
  Americas: { fill: '#10b981', border: '#059669' },
  Asia: { fill: '#f97316', border: '#ea580c' },
  Europe: { fill: '#3b82f6', border: '#2563eb' },
  Oceania: { fill: '#8b5cf6', border: '#7c3aed' },
  default: { fill: '#94a3b8', border: '#64748b' }
}

function Map() {
  const [countries, setCountries] = useState(null);
  const [selected, setSelected] = useState(null);
  const [countryInfo, setCountryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [votes, setVotes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [wcTeams, setWcTeams] = useState([])
  const wcTeamsRef = useRef([])
  const { user, mapStateRef, mapRef } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/countries.geojson")
      .then((res) => res.json())
      .then((data) => setCountries(data))

      api.get('/api/worldcup/groups')
        .then(res => {
          const teams = res.data.flatMap(g => g.teams || [])
          setWcTeams(teams)
          wcTeamsRef.current = teams
        })
        .catch(() => {})
  }, []);

  const loadCountryData = useCallback(
    async (code) => {
      setLoading(true);
      setCountryInfo(null);
      setFavorited(false);
      setVotes(0);
      setComments([]);

      try {
        const [infoRes, votesRes, commentsRes] = await Promise.all([
          api.get(`/api/countries/${code}`).catch(() => null),
          api.get(`/api/interactions/${code}/votes`),
          api.get(`/api/interactions/${code}/comments`),
        ]);

        if (infoRes) setCountryInfo(infoRes.data);
        setVotes(votesRes.data.total);
        setComments(commentsRes.data);

        if (user) {
          const favRes = await api.get(`/api/favorites/${code}`);
          setFavorited(favRes.data.favorited);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const handleCountryClick = (feature) => {
    const code = getCode(feature)
    setSelected({ ...feature.properties, resolvedCode: code })
    loadCountryData(code)
  }

  const handleFavorite = async () => {
    if (!user) return;
    const code = selected["ISO3166-1-Alpha-3"];
    const res = await api.post(`/api/favorites/${code}`);
    setFavorited(res.data.favorited);
  };

  const handleVote = async (value) => {
    if (!user) return;
    const code = selected["ISO3166-1-Alpha-3"];
    await api.post(`/api/interactions/${code}/votes`, { value });
    const res = await api.get(`/api/interactions/${code}/votes`);
    setVotes(res.data.total);
  };

  const handleComment = async () => {
    if (!user || !newComment.trim()) return;
    const code = selected["ISO3166-1-Alpha-3"];
    setCommentLoading(true);
    try {
      await api.post(`/api/interactions/${code}/comments`, {
        content: newComment,
      });
      const res = await api.get(`/api/interactions/${code}/comments`);
      setComments(res.data);
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const getCountryStyle = (feature) => {
    const code = getCode(feature)
    const isWC = wcTeamsRef.current.some(t => t.country_code === code)

    if (isWC) {
      return {
        fillColor: '#fbbf24',
        fillOpacity: 0.7,
        color: '#d97706',
        weight: 2
      }
    }

    const region = getRegionByCode(code)
    const colors = regionColors[region]
    return {
      fillColor: colors.fill,
      fillOpacity: 0.4,
      color: colors.border,
      weight: 1
    }
  }

  const onEachCountry = (feature, layer) => {
    layer.on({
      click: () => handleCountryClick(feature),
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.9, weight: 2 })
      },
      mouseout: (e) => {
        e.target.setStyle(getCountryStyle(feature))
      }
    })
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}a
    >
      <MapContainer
        center={mapStateRef.current.center}
        zoom={mapStateRef.current.zoom}
        minZoom={2}
        maxZoom={10}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
        style={{ width: "100vw", height: "100vh" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <MapStateKeeper mapStateRef={mapStateRef} />
        {countries && (
          <GeoJSON
            data={countries}
            style={getCountryStyle}
            onEachFeature={onEachCountry}
          />
        )}
        <MapRefKeeper mapRef={mapRef} />
      </MapContainer>

      {selected && (
        <div
          style={{
            position: "absolute",
            top: 78,
            right: 16,
            zIndex: 1000,
            background: "white",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            width: 280,
            overflow: "hidden",
          }}
        >
          {/* Header verde */}
          <div
            style={{
              background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)",
              padding: "16px",
              position: "relative",
            }}
          >
            <button
              onClick={() => {
                setSelected(null);
                setCountryInfo(null);
              }}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                width: 24,
                height: 24,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {countryInfo?.flag_url && (
                <img
                  src={countryInfo.flag_url}
                  alt={selected.name}
                  style={{
                    width: 48,
                    height: 32,
                    borderRadius: 4,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              )}
              <div>
                <h2
                  style={{
                    color: "white",
                    fontSize: 17,
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {selected.name}
                </h2>
                <p
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  {selected["ISO3166-1-Alpha-3"]}
                </p>
              </div>
            </div>
          </div>

          {/* Cuerpo */}
          <div style={{ padding: 16 }}>
            {loading && (
              <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                Cargando...
              </p>
            )}

            {!loading && countryInfo && (
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.8 }}>
                {countryInfo.capital && (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#94a3b8" }}>Capital</span>
                    <span style={{ fontWeight: 500, color: "#1e293b" }}>
                      {countryInfo.capital}
                    </span>
                  </div>
                )}
                {countryInfo.population && (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#94a3b8" }}>Población</span>
                    <span style={{ fontWeight: 500, color: "#1e293b" }}>
                      {Number(countryInfo.population).toLocaleString()}
                    </span>
                  </div>
                )}
                {countryInfo.region && (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#94a3b8" }}>Región</span>
                    <span style={{ fontWeight: 500, color: "#1e293b" }}>
                      {countryInfo.region}
                    </span>
                  </div>
                )}
                {countryInfo.world_cup_info && (
                  <div
                    style={{
                      marginTop: 10,
                      background: "#fef3c7",
                      borderRadius: 8,
                      padding: "8px 10px",
                      fontSize: 12,
                      color: "#78350f",
                    }}
                  >
                    🏆{" "}
                    {countryInfo.world_cup_info.length > 80
                      ? countryInfo.world_cup_info.slice(0, 80) + "..."
                      : countryInfo.world_cup_info}
                  </div>
                )}
              </div>
            )}

            {!loading && !countryInfo && (
              <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                Sin información disponible aún.
              </p>
            )}

            {/* Votos rápidos */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: "12px 0 0",
                paddingTop: 12,
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={() => handleVote(1)}
                disabled={!user}
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: user ? "pointer" : "not-allowed",
                  fontSize: 14,
                }}
              >
                <img src="/icons/like.svg" alt="Me gusta" style={{ width: 18 }} />
              </button>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: votes >= 0 ? "#16a34a" : "#dc2626",
                }}
              >
                {votes > 0 ? `+${votes}` : votes}
              </span>
              <button
                onClick={() => handleVote(-1)}
                disabled={!user}
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: user ? "pointer" : "not-allowed",
                  fontSize: 14,
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center'
                }}
              >
                <img src="/icons/dislike.svg" alt="No me gusta" style={{ width: 18 }} />
              </button>
              <button
                onClick={handleFavorite}
                disabled={!user}
                style={{
                  marginLeft: "auto",
                  background: favorited ? "#fef3c7" : "#f8fafc",
                  border: `1px solid ${favorited ? "#fcd34d" : "#e2e8f0"}`,
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: user ? "pointer" : "not-allowed",
                  fontSize: 14,
                }}
              >
                {favorited ? "⭐" : "☆"}
              </button>
            </div>

            {/* Botón ver más */}
            <button
              onClick={() =>
                navigate(`/country/${selected["ISO3166-1-Alpha-3"]}`)
              }
              style={{
                width: "100%",
                padding: "10px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 12,
              }}
            >
              Ver página completa →
            </button>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: 16,
        zIndex: 1000,
        background: 'rgba(15,23,42,0.85)',
        borderRadius: 10,
        padding: '10px 14px',
        backdropFilter: 'blur(4px)'
      }}>
        <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Leyenda
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: '#fbbf24', border: '2px solid #d97706' }} />
            <span style={{ color: 'white', fontSize: 12 }}>⚽ En el Mundial</span>
          </div>
          {Object.entries(regionColors).filter(([k]) => k !== 'default').map(([region, colors]) => (
            <div key={region} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: colors.fill, border: `1px solid ${colors.border}` }} />
              <span style={{ color: '#94a3b8', fontSize: 12 }}>{region === 'Americas' ? 'América' : region}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Map;
