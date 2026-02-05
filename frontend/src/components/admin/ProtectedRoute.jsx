import { Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0a0a0a',
                color: '#666',
            }}>
                Chargement...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}