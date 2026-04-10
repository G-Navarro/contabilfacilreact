import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PortalLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('https://contabilfacil-api.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('office_user', JSON.stringify(user));
                navigate('/portal');
            } else {
                const err = await response.json();
                setError(err.error || 'Falha no login');
            }
        } catch (err) {
            console.error(err);
            setError('Erro ao conectar com o servidor');
        }
    };

    return (
        <div style={{
            height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'var(--bg-body)'
        }}>
            <div style={{
                backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>Acesso ao Escritório</h2>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem',
                        borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Email</label>
                        <input
                            type="email" required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)', fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Senha</label>
                        <input
                            type="password" required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)', fontSize: '1rem'
                            }}
                        />
                    </div>
                    <button type="submit" style={{
                        backgroundColor: 'var(--secondary)', color: 'white', padding: '0.75rem',
                        borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '1rem', marginTop: '0.5rem'
                    }}>
                        Entrar
                    </button>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <a href="/admin/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
                            Acesso Administrativo
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
