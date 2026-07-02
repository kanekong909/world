import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import api from '../api'

function Login() {
  usePageTitle('Iniciar sesión')
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', form)
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #f3e8ff 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: 'clamp(24px, 5vw, 40px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Logo/Icono */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              width: 'clamp(56px, 8vw, 72px)',
              height: 'clamp(56px, 8vw, 72px)',
              background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
              transform: 'rotate(3deg)',
              transition: 'transform 0.3s ease'
            }}>
              <span style={{ fontSize: 'clamp(28px, 4vw, 36px)' }}>🚀</span>
            </div>
          </div>

          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Iniciar sesión
          </h1>
          
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: 'clamp(14px, 2vw, 16px)',
            marginBottom: '32px'
          }}>
            ¿No tienes cuenta?{' '}
            <Link 
              to="/register" 
              style={{
                color: '#2563eb',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
              onMouseLeave={(e) => e.target.style.color = '#2563eb'}
            >
              Regístrate
            </Link>
          </p>

          {error && (
            <div style={{
              marginBottom: '24px',
              padding: '14px 16px',
              background: '#fef2f2',
              borderLeft: '4px solid #ef4444',
              borderRadius: '10px',
              animation: 'shake 0.6s ease-in-out'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ 
                  fontSize: '18px',
                  flexShrink: 0
                }}>⚠️</span>
                <span style={{ 
                  color: '#b91c1c', 
                  fontSize: 'clamp(13px, 1.5vw, 14px)',
                  wordBreak: 'break-word'
                }}>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px' 
          }}>
            {/* Campo Email */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'clamp(13px, 1.5vw, 14px)',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Correo electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: '#9ca3af',
                  pointerEvents: 'none'
                }}>
                  📧
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                  style={{
                    width: '100%',
                    padding: 'clamp(12px, 2vw, 14px) 16px clamp(12px, 2vw, 14px) 46px',
                    background: '#f9fafb',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: 'clamp(14px, 1.5vw, 15px)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    color: '#1f2937'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                    e.target.style.background = 'white'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#f9fafb'
                  }}
                />
              </div>
            </div>

            {/* Campo Contraseña con visibilidad */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <label style={{
                  fontSize: 'clamp(13px, 1.5vw, 14px)',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Contraseña
                </label>
                <Link 
                  to="/forgot-password" 
                  style={{
                    fontSize: 'clamp(12px, 1.2vw, 13px)',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
                  onMouseLeave={(e) => e.target.style.color = '#2563eb'}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: '#9ca3af',
                  pointerEvents: 'none'
                }}>
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Tu contraseña"
                  style={{
                    width: '100%',
                    padding: 'clamp(12px, 2vw, 14px) 50px clamp(12px, 2vw, 14px) 46px',
                    background: '#f9fafb',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: 'clamp(14px, 1.5vw, 15px)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    color: '#1f2937'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                    e.target.style.background = 'white'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#f9fafb'
                  }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '4px',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0,0,0,0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Opción de recordar sesión */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '-4px'
            }}>
              <input
                type="checkbox"
                id="remember"
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#2563eb',
                  cursor: 'pointer'
                }}
              />
              <label 
                htmlFor="remember" 
                style={{
                  fontSize: 'clamp(13px, 1.3vw, 14px)',
                  color: '#4b5563',
                  cursor: 'pointer'
                }}
              >
                Recordarme
              </label>
            </div>

            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 'clamp(14px, 2vw, 16px) 0',
                background: loading 
                  ? '#93c5fd' 
                  : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease',
                marginTop: '4px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 20px 30px -5px rgba(59, 130, 246, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.3)'
                }
              }}
            >
              {loading ? (
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '10px'
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></span>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>

            {/* Separador */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginTop: '4px'
            }}>
              <div style={{
                flex: 1,
                height: '1px',
                background: '#e5e7eb'
              }} />
              <span style={{
                fontSize: 'clamp(12px, 1.2vw, 13px)',
                color: '#6b7280',
                whiteSpace: 'nowrap'
              }}>
                ¿Nuevo aquí?
              </span>
              <div style={{
                flex: 1,
                height: '1px',
                background: '#e5e7eb'
              }} />
            </div>

            {/* Botón de registro rápido */}
            <Link 
              to="/register"
              style={{
                display: 'block',
                width: '100%',
                padding: 'clamp(12px, 1.8vw, 14px) 0',
                background: 'transparent',
                color: '#2563eb',
                border: '2px solid #2563eb',
                borderRadius: '12px',
                fontSize: 'clamp(14px, 1.5vw, 15px)',
                fontWeight: '600',
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#2563eb'
                e.target.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.color = '#2563eb'
              }}
            >
              Crear cuenta nueva
            </Link>

            {/* Mensaje de seguridad */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '8px',
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.05)'
            }}>
              <span style={{ fontSize: '14px' }}>🔐</span>
              <span style={{
                fontSize: 'clamp(11px, 1.2vw, 12px)',
                color: '#6b7280'
              }}>
                Conexión segura y encriptada
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Mejoras para dispositivos muy pequeños */
        @media (max-width: 400px) {
          input, button {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Login