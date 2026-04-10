import { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';

export default function ClientSettings() {
    const { clientId } = useParams();
    const { client } = useOutletContext<any>();

    // State
    const [roles, setRoles] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'roles' | 'schedules'>('roles');

    // Forms
    const [newRole, setNewRole] = useState({ name: '', cbo: '' });

    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const emptyDay = { entry: '', breakStart: '', breakEnd: '', exit: '' };
    const [newScheduleName, setNewScheduleName] = useState('');
    const [newScheduleDays, setNewScheduleDays] = useState(
        days.reduce((acc, day) => ({ ...acc, [day]: { ...emptyDay } }), {} as any)
    );

    useEffect(() => {
        if (clientId) {
            fetchRoles();
            fetchSchedules();
        }
    }, [clientId]);

    const fetchRoles = () => {
        fetch(`http://localhost:3002/api/clients/${clientId}/roles`)
            .then(res => res.json())
            .then(setRoles)
            .catch(console.error);
    };

    const fetchSchedules = () => {
        fetch(`http://localhost:3002/api/clients/${clientId}/schedules`)
            .then(res => res.json())
            .then(setSchedules)
            .catch(console.error);
    };

    const handleRoleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch(`http://localhost:3002/api/clients/${clientId}/roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRole)
            });
            setNewRole({ name: '', cbo: '' });
            fetchRoles();
            alert('Cargo adicionado!');
        } catch (error) {
            console.error(error);
        }
    };

    const handleScheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch(`http://localhost:3002/api/clients/${clientId}/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newScheduleName, schedule: newScheduleDays })
            });
            setNewScheduleName('');
            setNewScheduleDays(days.reduce((acc, day) => ({ ...acc, [day]: { ...emptyDay } }), {} as any));
            fetchSchedules();
            alert('Jornada adicionada!');
        } catch (error) {
            console.error(error);
        }
    };

    const handleDayChange = (day: string, field: string, value: string) => {
        setNewScheduleDays((prev: any) => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    return (
        <div style={{ padding: 'var(--space-md)' }}>
            <h2 style={{ marginBottom: 'var(--space-md)' }}>Configurações de RH</h2>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: 'var(--space-lg)' }}>
                <button
                    onClick={() => setActiveTab('roles')}
                    style={{
                        padding: '8px 16px', borderRadius: '4px', cursor: 'pointer',
                        backgroundColor: activeTab === 'roles' ? 'var(--secondary)' : 'var(--bg-surface)',
                        color: activeTab === 'roles' ? 'white' : 'var(--text-body)',
                        border: '1px solid var(--border)'
                    }}
                >
                    Cargos (CBO)
                </button>
                <button
                    onClick={() => setActiveTab('schedules')}
                    style={{
                        padding: '8px 16px', borderRadius: '4px', cursor: 'pointer',
                        backgroundColor: activeTab === 'schedules' ? 'var(--secondary)' : 'var(--bg-surface)',
                        color: activeTab === 'schedules' ? 'white' : 'var(--text-body)',
                        border: '1px solid var(--border)'
                    }}
                >
                    Jornadas de Trabalho
                </button>
            </div>

            {activeTab === 'roles' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                    {/* Role List */}
                    <div>
                        <h3>Cargos Cadastrados</h3>
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                            {roles.map(role => (
                                <li key={role.id} style={{
                                    padding: '8px', borderBottom: '1px solid var(--border)',
                                    display: 'flex', justifyContent: 'space-between'
                                }}>
                                    <span>{role.name}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>CBO: {role.cbo}</span>
                                </li>
                            ))}
                            {roles.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhum cargo cadastrado.</p>}
                        </ul>
                    </div>

                    {/* Add Role Form */}
                    <div style={{ backgroundColor: 'var(--bg-surface)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', height: 'fit-content' }}>
                        <h3>Novo Cargo</h3>
                        <form onSubmit={handleRoleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <input
                                type="text" placeholder="Nome do Cargo" required
                                value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                            />
                            <input
                                type="text" placeholder="CBO"
                                value={newRole.cbo} onChange={e => setNewRole({ ...newRole, cbo: e.target.value })}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                            />
                            <button type="submit" style={{
                                padding: '8px', backgroundColor: 'var(--success)', color: 'white',
                                border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600
                            }}>
                                Salvar Cargo
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'schedules' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-lg)' }}>
                    {/* Schedule List */}
                    <div>
                        <h3>Jornadas Cadastradas</h3>
                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                            {schedules.map(sch => (
                                <div key={sch.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)' }}>
                                    <strong>{sch.name}</strong>
                                    {/* Optional: Show summary of hours */}
                                </div>
                            ))}
                            {schedules.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhuma jornada cadastrada.</p>}
                        </div>
                    </div>

                    {/* Add Schedule Form */}
                    <div style={{ backgroundColor: 'var(--bg-surface)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <h3>Nova Jornada</h3>
                        <form onSubmit={handleScheduleSubmit} style={{ marginTop: '1rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Nome da Jornada (Ex: Comercial, 12x36)</label>
                                <input
                                    type="text" required
                                    value={newScheduleName} onChange={e => setNewScheduleName(e.target.value)}
                                    style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                />
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            <th style={{ padding: '8px' }}>Dia</th>
                                            <th style={{ padding: '8px' }}>Entrada</th>
                                            <th style={{ padding: '8px' }}>Início Intervalo</th>
                                            <th style={{ padding: '8px' }}>Fim Intervalo</th>
                                            <th style={{ padding: '8px' }}>Saída</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {days.map(day => (
                                            <tr key={day} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '8px', fontWeight: 500 }}>{day}</td>
                                                {['entry', 'breakStart', 'breakEnd', 'exit'].map(field => (
                                                    <td key={field} style={{ padding: '8px' }}>
                                                        <input
                                                            type="time"
                                                            value={newScheduleDays[day][field]}
                                                            onChange={e => handleDayChange(day, field, e.target.value)}
                                                            style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border)', width: '100%' }}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <button type="submit" style={{
                                marginTop: '1rem',
                                padding: '10px 20px', backgroundColor: 'var(--success)', color: 'white',
                                border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600,
                                float: 'right'
                            }}>
                                Salvar Jornada
                            </button>
                            <div style={{ clear: 'both' }}></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
