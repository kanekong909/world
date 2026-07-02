import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMapEvents, useMap } from "react-leaflet";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from '../hooks/usePageTitle'
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
  Africa: { fill: '#f59e0b', border: '#d97706', glow: 'rgba(245, 158, 11, 0.2)' },
  Americas: { fill: '#10b981', border: '#059669', glow: 'rgba(16, 185, 129, 0.2)' },
  Asia: { fill: '#f97316', border: '#ea580c', glow: 'rgba(249, 115, 22, 0.2)' },
  Europe: { fill: '#3b82f6', border: '#2563eb', glow: 'rgba(59, 130, 246, 0.2)' },
  Oceania: { fill: '#8b5cf6', border: '#7c3aed', glow: 'rgba(139, 92, 246, 0.2)' },
  default: { fill: '#94a3b8', border: '#64748b', glow: 'rgba(148, 163, 184, 0.1)' }
}

function Map() {
  usePageTitle(null)
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
        weight: 2,
        dashArray: null
      }
    }

    const region = getRegionByCode(code)
    const colors = regionColors[region]
    return {
      fillColor: colors.fill,
      fillOpacity: 0.4,
      color: colors.border,
      weight: 1,
      dashArray: null
    }
  }

  const onEachCountry = (feature, layer) => {
    layer.on({
      click: () => handleCountryClick(feature),
      mouseover: (e) => {
        const target = e.target
        target.setStyle({ 
          fillOpacity: 0.9, 
          weight: 3,
          color: '#3b82f6'
        })
        target.bringToFront()
      },
      mouseout: (e) => {
        const target = e.target
        target.setStyle(getCountryStyle(feature))
      }
    })
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        paddingTop: "64px",
        overflow: "hidden",
        background: "#0f172a",
        boxSizing: "border-box"
      }}
    >
      <MapContainer
        center={mapStateRef.current.center}
        zoom={mapStateRef.current.zoom}
        minZoom={2}
        maxZoom={10}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
        style={{
          width: "100vw", 
          height: "calc(100vh - 64px)", // <- Resta la altura del navbar
          position: "relative"
         }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; CartoDB'
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

      {/* Header con título y búsqueda */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: 16,
        padding: '12px 24px',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)'
      }}>
        <span style={{ fontSize: 20 }}>🗺️</span>
        <h1 style={{
          color: 'white',
          fontSize: 18,
          fontWeight: 600,
          margin: 0,
          letterSpacing: '-0.01em'
        }}>
          Mapa Global
        </h1>
        <div style={{
          width: 1,
          height: 24,
          background: 'rgba(255,255,255,0.1)'
        }} />
        <span style={{
          color: '#94a3b8',
          fontSize: 13,
          fontWeight: 400
        }}>
          {countries?.features?.length || 0} países
        </span>
        {user && (
          <button
            onClick={() => navigate('/profile')}
            style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 8,
              padding: '4px 12px',
              color: '#60a5fa',
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(59, 130, 246, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(59, 130, 246, 0.2)'
            }}
          >
            👤 {user.name}
          </button>
        )}
      </div>

      {selected && (
        <div
          style={{
            position: "absolute",
            top: 90,
            right: 24,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(16px)",
            borderRadius: 20,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
            width: 320,
            maxHeight: "calc(100vh - 140px)",
            overflow: "auto",
            border: "1px solid rgba(255,255,255,0.05)",
            animation: "slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          {/* Header con bandera */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(124, 58, 237, 0.2))",
              padding: "20px 20px 16px",
              position: "relative",
              borderBottom: "1px solid rgba(255,255,255,0.05)"
            }}
          >
            <button
              onClick={() => {
                setSelected(null);
                setCountryInfo(null);
              }}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8",
                width: 28,
                height: 28,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.1)"
                e.target.style.color = "white"
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.05)"
                e.target.style.color = "#94a3b8"
              }}
            >
              ✕
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {countryInfo?.flag_url && (
                <img
                  src={countryInfo.flag_url}
                  alt={selected.name}
                  style={{
                    width: 56,
                    height: 36,
                    borderRadius: 6,
                    objectFit: "cover",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  }}
                />
              )}
              <div>
                <h2
                  style={{
                    color: "white",
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: "-0.01em"
                  }}
                >
                  {selected.name}
                </h2>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: 12,
                    margin: 0,
                    fontFamily: "monospace"
                  }}
                >
                  {selected["ISO3166-1-Alpha-3"]}
                  {wcTeamsRef.current.some(t => t.country_code === selected["ISO3166-1-Alpha-3"]) && (
                    <span style={{ marginLeft: 8, color: '#fbbf24' }}>⚽ Mundial 2026</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Cuerpo */}
          <div style={{ padding: "16px 20px 20px" }}>
            {loading && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '20px 0',
                gap: 8
              }}>
                <span style={{
                  display: 'inline-block',
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span style={{ color: "#94a3b8", fontSize: 13 }}>Cargando...</span>
              </div>
            )}

            {!loading && countryInfo && (
              <div style={{ 
                fontSize: 13, 
                color: "#cbd5e1", 
                lineHeight: 2
              }}>
                {countryInfo.capital && (
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    padding: '4px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.03)'
                  }}>
                    <span style={{ color: "#94a3b8" }}>Capital</span>
                    <span style={{ fontWeight: 500, color: "white" }}>
                      {countryInfo.capital}
                    </span>
                  </div>
                )}
                {countryInfo.population && (
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    padding: '4px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.03)'
                  }}>
                    <span style={{ color: "#94a3b8" }}>Población</span>
                    <span style={{ fontWeight: 500, color: "white" }}>
                      {Number(countryInfo.population).toLocaleString()}
                    </span>
                  </div>
                )}
                {countryInfo.region && (
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    padding: '4px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.03)'
                  }}>
                    <span style={{ color: "#94a3b8" }}>Región</span>
                    <span style={{ fontWeight: 500, color: "white" }}>
                      {countryInfo.region}
                    </span>
                  </div>
                )}
                {countryInfo.world_cup_info && (
                  <div
                    style={{
                      marginTop: 12,
                      background: "rgba(251, 191, 36, 0.1)",
                      border: "1px solid rgba(251, 191, 36, 0.2)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 12,
                      color: "#fbbf24",
                      lineHeight: 1.6
                    }}
                  >
                    🏆 {countryInfo.world_cup_info}
                  </div>
                )}
              </div>
            )}

            {!loading && !countryInfo && (
              <p style={{ color: "#94a3b8", fontSize: 13, margin: 0, textAlign: 'center', padding: '12px 0' }}>
                Sin información disponible aún.
              </p>
            )}

            {/* Interacciones */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: "16px 0 0",
                paddingTop: 16,
                borderTop: "1px solid rgba(255,255,255,0.05)",
                flexWrap: 'wrap'
              }}
            >
              <button
                onClick={() => handleVote(1)}
                disabled={!user}
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  cursor: user ? "pointer" : "not-allowed",
                  fontSize: 14,
                  color: "#34d399",
                  transition: "all 0.2s",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                onMouseEnter={(e) => {
                  if (user) {
                    e.target.style.background = "rgba(16, 185, 129, 0.25)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(16, 185, 129, 0.15)"
                }}
              >
                👍
              </button>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: votes >= 0 ? "#34d399" : "#f87171",
                  minWidth: 30,
                  textAlign: 'center'
                }}
              >
                {votes > 0 ? `+${votes}` : votes}
              </span>
              <button
                onClick={() => handleVote(-1)}
                disabled={!user}
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  cursor: user ? "pointer" : "not-allowed",
                  fontSize: 14,
                  color: "#f87171",
                  transition: "all 0.2s",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                onMouseEnter={(e) => {
                  if (user) {
                    e.target.style.background = "rgba(239, 68, 68, 0.25)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(239, 68, 68, 0.15)"
                }}
              >
                👎
              </button>
              <button
                onClick={handleFavorite}
                disabled={!user}
                style={{
                  marginLeft: "auto",
                  background: favorited ? "rgba(251, 191, 36, 0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${favorited ? "rgba(251, 191, 36, 0.3)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  cursor: user ? "pointer" : "not-allowed",
                  fontSize: 16,
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (user) {
                    e.target.style.background = favorited ? "rgba(251, 191, 36, 0.3)" : "rgba(255,255,255,0.1)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = favorited ? "rgba(251, 191, 36, 0.2)" : "rgba(255,255,255,0.05)"
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
                padding: "12px",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 14,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 10px 20px -8px rgba(37, 99, 235, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)"
                e.target.style.boxShadow = "0 20px 30px -8px rgba(37, 99, 235, 0.4)"
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)"
                e.target.style.boxShadow = "0 10px 20px -8px rgba(37, 99, 235, 0.3)"
              }}
            >
              Ver página completa →
            </button>
          </div>
        </div>
      )}

      {/* Leyenda mejorada */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: 24,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: 12,
        padding: '14px 18px',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 10px 30px -8px rgba(0,0,0,0.3)'
      }}>
        <p style={{ 
          color: '#94a3b8', 
          fontSize: 10, 
          fontWeight: 700, 
          margin: '0 0 10px', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em'
        }}>
          Leyenda
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: 16, 
              height: 16, 
              borderRadius: 4, 
              background: '#fbbf24', 
              border: '2px solid #d97706',
              boxShadow: '0 0 12px rgba(251, 191, 36, 0.3)'
            }} />
            <span style={{ color: 'white', fontSize: 12, fontWeight: 500 }}>⚽ En el Mundial</span>
          </div>
          {Object.entries(regionColors).filter(([k]) => k !== 'default').map(([region, colors]) => (
            <div key={region} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ 
                width: 16, 
                height: 16, 
                borderRadius: 4, 
                background: colors.fill, 
                border: `2px solid ${colors.border}`,
                opacity: 0.6
              }} />
              <span style={{ color: '#94a3b8', fontSize: 12 }}>
                {region === 'Americas' ? 'América' : region}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de zoom personalizados */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        right: 24,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <button
          onClick={() => {
            const map = mapRef.current
            if (map) map.zoomIn()
          }}
          style={{
            width: 40,
            height: 40,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 10,
            color: 'white',
            fontSize: 20,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(15, 23, 42, 0.85)'
          }}
        >
          +
        </button>
        <button
          onClick={() => {
            const map = mapRef.current
            if (map) map.zoomOut()
          }}
          style={{
            width: 40,
            height: 40,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 10,
            color: 'white',
            fontSize: 20,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(15, 23, 42, 0.85)'
          }}
        >
          −
        </button>
        <button
          onClick={() => {
            const map = mapRef.current
            if (map) map.setView([20, 0], 2)
          }}
          style={{
            width: 40,
            height: 40,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 10,
            color: '#94a3b8',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.3)'
            e.target.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(15, 23, 42, 0.85)'
            e.target.style.color = '#94a3b8'
          }}
        >
          ⊙
        </button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Scrollbar personalizado */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}

export default Map;