import { useState, useEffect } from 'react';
import { Plus, User, X, Shield } from 'lucide-react';

export default function OfficeList() {
    const [offices, setOffices] = useState<any[]>([]);
    const [selectedOffice, setSelectedOffice] = useState<any>(null);
    const [showUserModal, setShowUserModal] = useState(false);

    // User Form State
    const [userData, setUserData] = useState({ name: '', email: '', password: '' });
    const [officeUsers, setOfficeUsers] = useState<any[]>([]);

    useEffect(() => {
        fetchOffices();
    }, []);

    const fetchOffices = () => {
        fetch('http://localhost:3002/api/offices')
            .then(res => res.json())
            .then(data => setOffices(data))
            .catch(err => console.error('Error fetching offices:', err));
    };

    const toggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await fetch(`http://localhost:3002/api/offices/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchOffices();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleManageUsers = async (office: any) => {
        setSelectedOffice(office);
        setShowUserModal(true);
        loadUsers(office.id);
    };

    const loadUsers = async (officeId: number) => {
        try {
            const res = await fetch(`http://localhost:3002/api/offices/${officeId}/users`);
            const data = await res.json();
            setOfficeUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOffice) return;

        try {
            const response = await fetch('http://localhost:3002/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...userData, officeId: selectedOffice.id })
            });

            if (response.ok) {
                alert('Usuário criado com sucesso!');
                setUserData({ name: '', email: '', password: '' });
                loadUsers(selectedOffice.id);
                fetchOffices(); // Update user count
            } else {
                const err = await response.json();
                alert(`Erro: ${err.error}`);
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h2>Escritórios Cadastrados</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-md)' }}>
                {offices.map(office => (
                    <div key={office.id} style={{
                        backgroundColor: 'var(--bg-surface)',
                        padding: 'var(--space-lg)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ fontSize: '1.25rem' }}>{office.name}</h3>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    backgroundColor: office.status === 'active' ? '#dcfce7' : '#fee2e2',
                                    color: office.status === 'active' ? '#166534' : '#991b1b'
                                }}>
                                    {office.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>CNPJ: {office.cnpj}</p>

                            <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', backgroundColor: 'var(--bg-body)', borderRadius: 'var(--radius-sm)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                    <User size={16} />
                                    <span style={{ fontWeight: 500 }}>{office.user_count} Usuários</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                            <button
                                onClick={() => handleManageUsers(office)}
                                style={{
                                    flex: 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '8px', borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'var(--primary)', color: 'white'
                                }}
                            >
                                <User size={16} /> Gerenciar
                            </button>

                            <button
                                onClick={() => toggleStatus(office.id, office.status)}
                                style={{
                                    padding: '8px', borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'white', border: '1px solid var(--border)',
                                    color: office.status === 'active' ? '#ef4444' : '#10b981'
                                }}
                                title={office.status === 'active' ? 'Desativar Acesso' : 'Ativar Acesso'}
                            >
                                <Shield size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Manage Users Modal */}
            {showUserModal && selectedOffice && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'var(--bg-surface)',
                        padding: 'var(--space-xl)',
                        borderRadius: 'var(--radius-lg)',
                        width: '90%', maxWidth: '500px',
                        maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                            <h3>Usuários - {selectedOffice.name}</h3>
                            <button onClick={() => setShowUserModal(false)}><X size={24} /></button>
                        </div>

                        {/* List Users */}
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <h4 style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-muted)' }}>Usuários Ativos</h4>
                            {officeUsers.length === 0 ? (
                                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Nenhum usuário cadastrado.</p>
                            ) : (
                                <ul style={{ listStyle: 'none' }}>
                                    {officeUsers.map(user => (
                                        <li key={user.id} style={{
                                            padding: '8px', borderBottom: '1px solid var(--border)',
                                            display: 'flex', justifyContent: 'space-between'
                                        }}>
                                            <span>{user.name}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Add User Form */}
                        <form onSubmit={handleAddUser} style={{
                            backgroundColor: 'var(--bg-body)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)'
                        }}>
                            <h4 style={{ marginBottom: 'var(--space-md)' }}>Adicionar Usuário</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                <input
                                    type="text" placeholder="Nome" required
                                    value={userData.name}
                                    onChange={e => setUserData({ ...userData, name: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                />
                                <input
                                    type="email" placeholder="Email" required
                                    value={userData.email}
                                    onChange={e => setUserData({ ...userData, email: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                />
                                <input
                                    type="password" placeholder="Senha" required
                                    value={userData.password}
                                    onChange={e => setUserData({ ...userData, password: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                />
                                <button type="submit" style={{
                                    marginTop: '8px', backgroundColor: 'var(--secondary)', color: 'white',
                                    padding: '8px', borderRadius: '4px', fontWeight: 600
                                }}>
                                    <Plus size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Criar Usuário
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
