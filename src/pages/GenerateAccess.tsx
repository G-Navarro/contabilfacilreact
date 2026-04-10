import { useState, useEffect } from 'react';

export default function GenerateAccess() {
    const [selectedOffice, setSelectedOffice] = useState('');
    const [generatedToken, setGeneratedToken] = useState('');
    const [offices, setOffices] = useState<any[]>([]);

    useEffect(() => {
        fetch('http://127.0.0.1:3002/api/offices')
            .then(res => res.json())
            .then(data => setOffices(data))
            .catch(err => console.error('Failed to load offices:', err));
    }, []);

    const handleGenerate = async () => {
        if (!selectedOffice) return;

        try {
            const response = await fetch('http://127.0.0.1:3002/api/tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ officeId: selectedOffice })
            });

            const data = await response.json();
            if (response.ok) {
                setGeneratedToken(data.token);
            } else {
                alert('Erro ao gerar token');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: 'var(--space-lg)' }}>Gerar Acesso</h2>

            <div style={{
                backgroundColor: 'var(--bg-surface)',
                padding: 'var(--space-xl)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <p style={{ marginBottom: 'var(--space-md)', color: 'var(--text-muted)' }}>
                    Selecione um escritório para gerar uma chave de acesso temporária.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                    <label htmlFor="office-select" style={{ fontWeight: 500 }}>Escritório</label>
                    <select
                        id="office-select"
                        value={selectedOffice}
                        onChange={(e) => {
                            setSelectedOffice(e.target.value);
                            setGeneratedToken('');
                        }}
                        style={{
                            padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontSize: '1rem',
                            backgroundColor: 'var(--bg-body)'
                        }}
                    >
                        <option value="">Selecione um escritório...</option>
                        {offices.map(office => (
                            <option key={office.id} value={office.id}>{office.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!selectedOffice}
                    style={{
                        backgroundColor: !selectedOffice ? 'var(--text-muted)' : 'var(--secondary)',
                        color: 'white',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        width: '100%',
                        cursor: !selectedOffice ? 'not-allowed' : 'pointer',
                        marginBottom: 'var(--space-lg)'
                    }}
                >
                    Gerar Novo Token
                </button>

                {generatedToken && (
                    <div style={{
                        marginTop: 'var(--space-lg)',
                        padding: 'var(--space-md)',
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: 'var(--radius-md)'
                    }}>
                        <p style={{ color: '#047857', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>Token Gerado com Sucesso:</p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            padding: 'var(--space-sm)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px dashed #059669',
                            fontFamily: 'monospace',
                            fontSize: '1.1rem'
                        }}>
                            {generatedToken}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
