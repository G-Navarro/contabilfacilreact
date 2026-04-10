import { useState, useEffect } from 'react';

export default function BillingManager() {
    const [billings, setBillings] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        clientId: '', amount: '', due_date: ''
    });

    const user = JSON.parse(localStorage.getItem('office_user') || '{}');

    useEffect(() => {
        if (user.office_id) {
            fetchBillingsAndClients();
        }
    }, []);

    const fetchBillingsAndClients = () => {
        fetch(`http://localhost:3002/api/portal/${user.office_id}/billings`)
            .then(res => res.json())
            .then(data => setBillings(data))
            .catch(err => console.error(err));

        fetch(`http://localhost:3002/api/portal/${user.office_id}/clients`)
            .then(res => res.json())
            .then(data => setClients(data))
            .catch(err => console.error(err));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3002/api/billings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, officeId: user.office_id })
            });

            if (response.ok) {
                alert('Cobrança registrada!');
                setFormData({ clientId: '', amount: '', due_date: '' });
                setShowForm(false);
                fetchBillingsAndClients();
            } else {
                alert('Erro ao registrar cobrança');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h2>Gestão de Cobranças</h2>
                <button onClick={() => setShowForm(!showForm)} style={{
                    backgroundColor: 'var(--secondary)', color: 'white', padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600
                }}>
                    {showForm ? 'Cancelar' : 'Nova Cobrança'}
                </button>
            </div>

            {showForm && (
                <div style={{
                    backgroundColor: 'var(--bg-surface)', padding: 'var(--space-lg)',
                    borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)', border: '1px solid var(--border)'
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-md)' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem' }}>Cliente</label>
                            <select
                                value={formData.clientId} required
                                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                            >
                                <option value="">Selecione...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem' }}>Valor (R$)</label>
                            <input
                                type="number" step="0.01" value={formData.amount} required
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem' }}>Data de Vencimento</label>
                            <input
                                type="date" value={formData.due_date} required
                                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                            />
                        </div>
                        <button type="submit" style={{
                            backgroundColor: 'var(--success)', color: 'white', padding: '0.5rem 1.5rem',
                            borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600
                        }}>Salvar Cobrança</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {billings.map(item => (
                    <div key={item.id} style={{
                        backgroundColor: 'var(--bg-surface)', padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <h4 style={{ fontSize: '1rem', marginBottom: '2px' }}>R$ {parseFloat(item.amount).toFixed(2)}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Client: {item.client_name}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{
                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                backgroundColor: item.status === 'paid' ? '#dcfce7' : '#fee2e2',
                                color: item.status === 'paid' ? '#166534' : '#991b1b'
                            }}>{item.status === 'paid' ? 'Pago' : 'Pendente'}</span>
                            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>{new Date(item.due_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
