import { useState, useEffect } from 'react';

export default function TaskManager() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        clientId: '', title: '', due_date: ''
    });

    const user = JSON.parse(localStorage.getItem('office_user') || '{}');

    useEffect(() => {
        if (user.office_id) {
            fetchTasks();
            fetchClients();
        }
    }, []);

    const fetchTasks = () => {
        fetch(`http://localhost:3002/api/portal/${user.office_id}/tasks`)
            .then(res => res.json())
            .then(data => setTasks(data))
            .catch(err => console.error(err));
    };

    const fetchClients = () => {
        fetch(`http://localhost:3002/api/portal/${user.office_id}/clients`)
            .then(res => res.json())
            .then(data => setClients(data))
            .catch(err => console.error(err));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3002/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, officeId: user.office_id })
            });

            if (response.ok) {
                alert('Tarefa criada!');
                setFormData({ clientId: '', title: '', due_date: '' });
                setShowForm(false);
                fetchTasks();
            } else {
                alert('Erro ao criar tarefa');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h2>Gestão de Tarefas</h2>
                <button onClick={() => setShowForm(!showForm)} style={{
                    backgroundColor: 'var(--secondary)', color: 'white', padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600
                }}>
                    {showForm ? 'Cancelar' : 'Nova Tarefa'}
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
                            <label style={{ display: 'block', fontSize: '0.9rem' }}>Título / Descrição</label>
                            <input
                                type="text" value={formData.title} required
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
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
                        }}>Salvar Tarefa</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {tasks.map(task => (
                    <div key={task.id} style={{
                        backgroundColor: 'var(--bg-surface)', padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <h4 style={{ fontSize: '1rem', marginBottom: '2px' }}>{task.title}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Client: {task.client_name}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{
                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                backgroundColor: task.status === 'done' ? '#dcfce7' : '#fef9c3',
                                color: task.status === 'done' ? '#166534' : '#854d0e'
                            }}>{task.status}</span>
                            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>{new Date(task.due_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
