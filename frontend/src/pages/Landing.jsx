import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { usePageTitle } from '../hooks/usePageTitle'
import { useEffect, useRef } from 'react'

function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { bg, surface, border, text, textMuted, textSecondary } = useTheme()
  usePageTitle(null)

  // Refs para efectos parallax
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      
      // Parallax para el hero
      if (heroRef.current) {
        const hero = heroRef.current
        const heroContent = hero.querySelector('.hero-content')
        const heroBg = hero.querySelector('.hero-bg')
        if (heroContent) {
          heroContent.style.transform = `translateY(${scrollY * 0.3}px)`
          heroContent.style.opacity = Math.max(0, 1 - scrollY / 800)
        }
        if (heroBg) {
          heroBg.style.transform = `translateY(${scrollY * 0.1}px)`
        }
      }

      // Parallax para features
      if (featuresRef.current) {
        const rect = featuresRef.current.getBoundingClientRect()
        const center = window.innerHeight / 2
        const offset = rect.top - center
        const items = featuresRef.current.querySelectorAll('.feature-item')
        items.forEach((item, index) => {
          const speed = 0.05 * (index + 1)
          const y = offset * speed
          item.style.transform = `translateY(${y}px)`
          item.style.opacity = Math.max(0.3, 1 - Math.abs(offset) / 800)
        })
      }

      // Parallax para CTA
      if (ctaRef.current) {
        const rect = ctaRef.current.getBoundingClientRect()
        const center = window.innerHeight / 2
        const offset = rect.top - center
        ctaRef.current.style.transform = `scale(${Math.max(0.95, 1 - Math.abs(offset) / 2000)})`
        ctaRef.current.style.opacity = Math.max(0.3, 1 - Math.abs(offset) / 1000)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    { icon: '🗺️', title: 'Mapa interactivo', desc: 'Haz clic en cualquier país y descubre su cultura, historia y datos.' },
    { icon: '⚽', title: 'Mundial 2026', desc: 'Sigue grupos, partidos y resultados en tiempo real.' },
    { icon: '💬', title: 'Comunidad', desc: 'Comenta, reacciona y comparte fotos con otros exploradores.' },
    { icon: '⭐', title: 'Favoritos', desc: 'Guarda los países que más te gustan en tu perfil.' },
    { icon: '🔮', title: 'Predicciones', desc: '¿Quién ganará el Mundial? Vota y compara con la comunidad.' },
    { icon: '📊', title: 'Estadísticas', desc: 'Descubre los países más populares y comentados.' },
  ]

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: bg,
      overflow: 'hidden'
    }}>

      {/* Hero Section con Parallax */}
      <div 
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '80px 24px'
        }}
      >
        {/* Fondo con gradiente animado y parallax */}
        <div 
          className="hero-bg"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.15), rgba(124, 58, 237, 0.1), transparent 70%)',
            animation: 'pulse 8s ease-in-out infinite'
          }}
        />
        
        {/* Partículas flotantes */}
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                background: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#7c3aed' : '#8b5cf6',
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.2,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Contenido del Hero */}
        <div 
          className="hero-content"
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            maxWidth: 800,
            margin: '0 auto'
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(59, 130, 246, 0.1)',
            backdropFilter: 'blur(10px)',
            color: '#2563eb',
            fontSize: '13px',
            padding: '8px 20px',
            borderRadius: '50px',
            marginBottom: '32px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            fontWeight: 500
          }}>
            <span style={{ 
              display: 'inline-block',
              width: 8,
              height: 8,
              background: '#22c55e',
              borderRadius: '50%',
              animation: 'pulse-dot 2s ease-in-out infinite'
            }} />
            🏆 Mundial 2026 — En vivo
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 8vw, 80px)',
            fontWeight: 800,
            color: text,
            margin: '0 0 24px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #1f2937 0%, #3b82f6 50%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Explora el mundo,<br />vive el Mundial
          </h1>

          <p style={{
            fontSize: 'clamp(18px, 2vw, 22px)',
            color: textSecondary,
            lineHeight: 1.7,
            margin: '0 auto 40px',
            maxWidth: 560,
            fontWeight: 300
          }}>
            Descubre países, sigue el Mundial 2026 en tiempo real y conecta con una comunidad global de exploradores.
          </p>

          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center', 
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate('/map')}
              style={{
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 20px 40px -12px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 30px 50px -12px rgba(37, 99, 235, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 20px 40px -12px rgba(37, 99, 235, 0.4)'
              }}
            >
              Explorar el mapa 🌍
            </button>
            <button
              onClick={() => navigate('/worldcup')}
              style={{
                padding: '16px 40px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: text,
                border: `2px solid ${border}`,
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(59, 130, 246, 0.1)'
                e.target.style.borderColor = '#3b82f6'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                e.target.style.borderColor = border
              }}
            >
              Ver el Mundial ⚽
            </button>
          </div>

          {/* Stats con animación */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '60px',
            marginTop: '56px',
            flexWrap: 'wrap'
          }}>
            {[
              { num: '195', label: 'Países' },
              { num: '2026', label: 'Mundial' },
              { num: '∞', label: 'Exploradores' }
            ].map((s, index) => (
              <div 
                key={s.label}
                style={{
                  textAlign: 'center',
                  animation: `fade-up 0.8s ease-out ${index * 0.2}s both`
                }}
              >
                <div style={{
                  fontSize: 'clamp(28px, 4vw, 38px)',
                  fontWeight: 700,
                  color: '#3b82f6',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {s.num}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: textMuted,
                  marginTop: 4,
                  fontWeight: 400
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'bounce 2s ease-in-out infinite',
          cursor: 'pointer',
          color: textMuted,
          fontSize: 14
        }}>
          <div style={{
            width: 24,
            height: 40,
            border: `2px solid ${textMuted}`,
            borderRadius: 12,
            margin: '0 auto 8px',
            position: 'relative'
          }}>
            <div style={{
              width: 4,
              height: 8,
              background: '#3b82f6',
              borderRadius: 2,
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              animation: 'scroll-down 2s ease-in-out infinite'
            }} />
          </div>
          <span style={{ fontSize: 12, opacity: 0.5 }}>SCROLL</span>
        </div>
      </div>

      {/* Features Section con Parallax */}
      <div 
        ref={featuresRef}
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '60px 24px 80px',
          position: 'relative'
        }}
      >
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#2563eb',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '4px 16px',
            borderRadius: '50px'
          }}>
            Características
          </span>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            color: text,
            margin: '16px 0 8px',
            lineHeight: 1.2
          }}>
            Todo en un solo lugar
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 1.5vw, 20px)',
            color: textSecondary,
            maxWidth: 480,
            margin: '0 auto'
          }}>
            Explora, aprende y conecta con el mundo
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {features.map((f, index) => (
            <div
              key={f.title}
              className="feature-item"
              style={{
                background: surface,
                borderRadius: '20px',
                padding: '28px 24px',
                border: `1px solid ${border}`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(0, 0, 0, 0.15)'
                e.currentTarget.style.borderColor = '#3b82f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = border
              }}
            >
              <div style={{
                fontSize: '40px',
                marginBottom: '16px',
                display: 'block'
              }}>
                {f.icon}
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: text,
                margin: '0 0 8px'
              }}>
                {f.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: textSecondary,
                lineHeight: 1.6,
                margin: 0
              }}>
                {f.desc}
              </p>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 100,
                height: 100,
                background: 'radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.05), transparent 70%)',
                borderRadius: '0 20px 0 100%'
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Mundial Banner */}
      <div style={{
        maxWidth: 960,
        margin: '0 auto 60px',
        padding: '0 24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(124, 58, 237, 0.1))',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '24px',
          padding: 'clamp(24px, 4vw, 40px)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%)',
            borderRadius: '50%'
          }} />
          
          <span style={{
            fontSize: 'clamp(48px, 6vw, 64px)',
            flexShrink: 0
          }}>🏆</span>
          
          <div style={{ flex: 1, minWidth: 200, position: 'relative', zIndex: 1 }}>
            <h3 style={{
              fontSize: 'clamp(18px, 2vw, 22px)',
              fontWeight: 700,
              color: '#1e40af',
              margin: '0 0 4px'
            }}>
              Mundial 2026 — En vivo
            </h3>
            <p style={{
              fontSize: 'clamp(14px, 1.2vw, 16px)',
              color: '#3b82f6',
              margin: 0,
              fontWeight: 400
            }}>
              Grupos, fixture, resultados y predicciones actualizadas
            </p>
          </div>
          
          <button
            onClick={() => navigate('/worldcup')}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 10px 20px -8px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.3s ease',
              position: 'relative',
              zIndex: 1
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)'
              e.target.style.boxShadow = '0 20px 30px -8px rgba(37, 99, 235, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = '0 10px 20px -8px rgba(37, 99, 235, 0.3)'
            }}
          >
            Ver fixture →
          </button>
        </div>
      </div>

      {/* CTA Final con Parallax */}
      <div 
        ref={ctaRef}
        style={{
          position: 'relative',
          textAlign: 'center',
          padding: 'clamp(60px, 10vw, 100px) 24px',
          margin: '0 0 0',
          background: 'linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.03) 50%, transparent)',
          overflow: 'hidden'
        }}
      >
        {/* Fondo con efecto */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(59, 130, 246, 0.1), transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            color: text,
            margin: '0 0 16px',
            lineHeight: 1.2
          }}>
            Empieza a explorar ahora
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 1.5vw, 20px)',
            color: textSecondary,
            margin: '0 0 36px',
            maxWidth: 480,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Únete a la comunidad de exploradores. Es gratis.
          </p>
          
          {user ? (
            <button
              onClick={() => navigate('/map')}
              style={{
                padding: '18px 48px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 20px 40px -12px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 30px 50px -12px rgba(37, 99, 235, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 20px 40px -12px rgba(37, 99, 235, 0.4)'
              }}
            >
              Ir al mapa 🌍
            </button>
          ) : (
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => navigate('/register')}
                style={{
                  padding: '18px 48px',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '18px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 20px 40px -12px rgba(37, 99, 235, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)'
                  e.target.style.boxShadow = '0 30px 50px -12px rgba(37, 99, 235, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 20px 40px -12px rgba(37, 99, 235, 0.4)'
                }}
              >
                Crear cuenta gratis ✨
              </button>
              <button
                onClick={() => navigate('/map')}
                style={{
                  padding: '18px 48px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: text,
                  border: `2px solid ${border}`,
                  borderRadius: '16px',
                  fontSize: '18px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(59, 130, 246, 0.05)'
                  e.target.style.borderColor = '#3b82f6'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.target.style.borderColor = border
                }}
              >
                Explorar sin cuenta
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          25% {
            transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * -20}px) scale(1.2);
            opacity: 0.4;
          }
          50% {
            transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * -40}px) scale(1);
            opacity: 0.2;
          }
          75% {
            transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * -20}px) scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        @keyframes pulse-dot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-8px);
          }
        }

        @keyframes scroll-down {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateX(-50%) translateY(12px);
            opacity: 0.3;
          }
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Better scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  )
}

export default Landing