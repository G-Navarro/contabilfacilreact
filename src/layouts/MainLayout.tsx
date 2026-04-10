import { Link, Outlet, useNavigate } from 'react-router-dom';

import { useEffect } from 'react';

export default function MainLayout() {
    const navigate = useNavigate();

    useEffect(() => {
        const admin = localStorage.getItem('admin_user');
        if (!admin) {
            navigate('/admin/login');
        }
    }, [navigate]);
    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-body)' }}>
            {/* Sidebar Placeholder */}
            <aside style={{
                width: '250px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                padding: 'var(--space-md)'
            }}>
                <h2 style={{ marginBottom: 'var(--space-xl)' }}>ContabilFacil</h2>
                <nav>
                    <ul style={{ listStyle: 'none', padding: 0 }}>

                        <li style={{ marginBottom: 'var(--space-sm)' }}>
                            <Link to="/" style={{ display: 'block', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                        </li>
                        <li style={{ marginBottom: 'var(--space-sm)' }}>
                            <Link to="/register-office" style={{ display: 'block', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', color: 'white', textDecoration: 'none' }}>Cadastrar Escritório</Link>
                        </li>
                        <li style={{ marginBottom: 'var(--space-sm)' }}>
                            <Link to="/generate-access" style={{ display: 'block', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', color: 'white', textDecoration: 'none' }}>Gerar Acesso</Link>
                        </li>
                    </ul>
                </nav>
                <div style={{ marginTop: 'auto', padding: 'var(--space-md)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={() => {
                            localStorage.removeItem('admin_user');
                            navigate('/admin/login');
                        }}
                        style={{
                            background: 'none', border: 'none', color: '#f87171',
                            cursor: 'pointer', fontSize: '0.9rem', width: '100%', textAlign: 'left'
                        }}
                    >
                        Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: 'var(--space-xl)', overflowY: 'auto' }}>
                <header style={{
                    marginBottom: 'var(--space-lg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2>Dashboard</h2>
                    <div>User Profile</div>
                </header>
                <Outlet />
            </main>
        </div>
    );
}
