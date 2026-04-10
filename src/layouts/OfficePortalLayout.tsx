import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function OfficePortalLayout() {
    const navigate = useNavigate();
    // Basic check if user is logged in
    const user = JSON.parse(localStorage.getItem('office_user') || 'null');

    const handleLogout = () => {
        localStorage.removeItem('office_user');
        navigate('/portal/login');
    };

    if (!user) {
        // Redirect logic handled in useEffect or just render null
        // Here we assume protected route wrapper or simple check
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Acesso negado. <Link to="/portal/login">Faça login</Link></p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-body)' }}>
            {/* Portal Sidebar */}
            <aside style={{
                width: '250px',
                backgroundColor: 'var(--primary-light)',
                color: 'white',
                padding: 'var(--space-md)',
                display: 'flex', flexDirection: 'column'
            }}>
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>Portal do Escritório</h2>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{user.officeName}</p>
                </div>

                <nav style={{ flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: 'var(--space-sm)' }}>
                            <Link to="/portal" style={{ display: 'block', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                        </li>
                        <li style={{ marginBottom: 'var(--space-sm)' }}>
                            <Link to="/portal/clients" style={{ display: 'block', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', color: 'white', textDecoration: 'none' }}>Clientes</Link>
                        </li>
                    </ul>
                </nav>

                <div>
                    <div style={{ padding: 'var(--space-sm)', borderTop: '1px solid #334155', marginTop: 'var(--space-md)' }}>
                        <p style={{ fontSize: '0.9rem' }}>{user.name}</p>
                        <button
                            onClick={handleLogout}
                            style={{
                                color: '#f87171', fontSize: '0.8rem', marginTop: '4px',
                                background: 'none', border: 'none', cursor: 'pointer', padding: 0
                            }}
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: 'var(--space-xl)', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
}
