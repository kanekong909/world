import { useAuth } from '../context/AuthContext'

export function useTheme() {
  const { darkMode } = useAuth()

  const bg = darkMode ? '#0f172a' : '#f1f5f9'
  const surface = darkMode ? '#1e293b' : 'white'
  const border = darkMode ? '#334155' : '#e2e8f0'
  const text = darkMode ? '#f1f5f9' : '#1e293b'
  const textMuted = darkMode ? '#64748b' : '#94a3b8'
  const textSecondary = darkMode ? '#94a3b8' : '#475569'

  return { darkMode, bg, surface, border, text, textMuted, textSecondary }
}