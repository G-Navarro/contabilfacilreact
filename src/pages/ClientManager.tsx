import { useState, useEffect } from 'react';

export default function ClientManager() {
    const [clients, setClients] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', cnpj: '', email: '', phone: ''
    });
    const [loading, setLoading] = useState(false);

    // Get current office user
    const user = JSON.parse(localStorage.getItem('office_user') || '{}');

    useEffect(() => {
        if (user.office_id) fetchClients();
    }, []);

    const fetchClients = () => {
        fetch(`https://contabilfacil-api.onrender.com/api/portal/${user.office_id}/clients`)
            .then(res => res.json())
            .then(data => setClients(data))
            .catch(err => console.error(err));
    };

    const checkCnpj = async (cnpj: string) => {
        const cleaned = cnpj.replace(/\D/g, '');
        if (cleaned.length !== 14) return;

        setLoading(true);
        try {
            const response = await fetch(`https://contabilfacil-api.onrender.com/api/cnpj/${cleaned}`);
            const data = await response.json();

            if (response.ok) {
                setFormData(prev => ({
                    ...prev,
                    name: data.razao_social || data.nome_fantasia || '',
                    email: data.email || '',
                    phone: data.ddd_telefone_1 || ''
                }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('https://contabilfacil-api.onrender.com/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, officeId: user.office_id })
            });

            if (response.ok) {
                alert('Cliente cadastrado!');
                setFormData({ name: '', cnpj: '', email: '', phone: '' });
                setShowForm(false);
                fetchClients();
            } else {
                alert('Erro ao cadastrar cliente');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h2>Gestão de Clientes</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        backgroundColor: 'var(--secondary)', color: 'white', padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600
                    }}
                >
                    {showForm ? 'Cancelar' : 'Novo Cliente'}
                </button>
            </div>

            {showForm && (
                <div style={{
                    backgroundColor: 'var(--bg-surface)', padding: 'var(--space-lg)',
                    borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)', border: '1px solid var(--border)'
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.9rem' }}>CNPJ</label>
                            <input
                                type="text" value={formData.cnpj} required
                                onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                                onBlur={e => checkCnpj(e.target.value)}
                                placeholder="00.000.000/0000-00"
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                            />
                            {loading && <small style={{ color: 'var(--secondary)' }}>Buscando dados...</small>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.9rem' }}>Nome da Empresa</label>
                            <input
                                type="text" value={formData.name} required
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.9rem' }}>Email</label>
                            <input
                                type="email" value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.9rem' }}>Telefone</label>
                            <input
                                type="tel" value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                            />
                        </div>
                        <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                            <button type="submit" style={{
                                backgroundColor: 'var(--success)', color: 'white', padding: '0.5rem 1.5rem',
                                borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600
                            }}>Salvar Cliente</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
                {clients.map(client => (
                    <div key={client.id}
                        onClick={() => window.location.href = `/portal/client/${client.id}`}
                        style={{
                            backgroundColor: 'var(--bg-surface)', padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer',
                            transition: 'transform 0.1s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{client.name}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>CNPJ: {client.cnpj}</p>
                        </div>

                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '0.9rem' }}>
                            <p>Email: {client.email || '-'}</p>
                            <p style={{ marginBottom: '8px' }}>Tel: {client.phone || '-'}</p>

                            <span style={{
                                color: 'var(--secondary)', fontWeight: 500, fontSize: '0.85rem',
                                display: 'inline-block', marginTop: '4px'
                            }}>
                                Acessar Painel &rarr;
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
