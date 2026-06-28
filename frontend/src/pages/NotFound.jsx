import { useNavigate } from "react-router-dom";

function NotFound() {
    const navigate = useNavigate()

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f1f5f9',
            padding: 24,
            textAlign: "center"
        }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>🌍</div>
            <h1 style={{ fontSize: 28, color: '#1e293b', marginBottom: 8 }}>Página no encontrada</h1>
            <p style={{ color: '#64748b', fontSize: 16, marginBottom: 32, maxWidth: 360 }}>
                Esta ruta no existe en el mapa. Vuelve al inicio y sigue explorando.
            </p>
            <button
                onClick={() => navigate('/')}
                style={{
                padding: '12px 28px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer'
                }}
            >
                Volver al mapa
            </button>
        </div>
    )
}

export default NotFound