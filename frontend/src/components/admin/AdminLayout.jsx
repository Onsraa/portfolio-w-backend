import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useTheme } from '@context/ThemeContext';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const { colors } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', exact: true },
        { path: '/admin/experiences', label: 'Expériences' },
        { path: '/admin/projects', label: 'Projets' },
        { path: '/admin/articles', label: 'Articles' },
        { path: '/admin/skills', label: 'Compétences' },
        { path: '/admin/settings', label: 'Paramètres' },
    ];

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: colors.bg,
            color: colors.text,
            fontFamily: '"IBM Plex Mono", monospace',
        }}>
            {/* Header */}
            <header style={{
                borderBottom: `1px solid ${colors.borderLight}`,
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <Link to="/" style={{ color: colors.accent, textDecoration: 'none', fontSize: '18px' }}>
                        ← Portfolio
                    </Link>
                    <span style={{ color: colors.textDarker }}>|</span>
                    <span style={{ color: colors.textMuted, fontSize: '14px' }}>Administration</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: colors.textMuted, fontSize: '13px' }}>{user?.username}</span>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'none',
                            border: `1px solid ${colors.border}`,
                            color: colors.textSecondary,
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        Déconnexion
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex' }}>
                {/* Sidebar */}
                <nav style={{
                    width: '200px',
                    borderRight: `1px solid ${colors.borderLight}`,
                    minHeight: 'calc(100vh - 60px)',
                    padding: '24px 0',
                }}>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'block',
                                padding: '12px 24px',
                                color: isActive(item.path, item.exact) ? colors.accent : colors.textMuted,
                                textDecoration: 'none',
                                fontSize: '13px',
                                borderLeft: isActive(item.path, item.exact) ? `2px solid ${colors.accent}` : '2px solid transparent',
                                backgroundColor: isActive(item.path, item.exact) ? colors.bgHover : 'transparent',
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Main content */}
                <main style={{
                    flex: 1,
                    padding: '32px',
                    maxWidth: '1200px',
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}