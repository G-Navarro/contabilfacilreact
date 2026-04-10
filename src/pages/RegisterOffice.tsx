import { useState } from 'react';

export default function RegisterOffice() {
    const [formData, setFormData] = useState({
        name: '',
        cnpj: '',
        email: '',
        phone: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
    });
    const [loading, setLoading] = useState(false);

    const checkCnpj = async (cnpj: string) => {
        const cleaned = cnpj.replace(/\D/g, '');
        if (cleaned.length !== 14) return;

        setLoading(true);
        try {
            // Use local proxy to avoid CORS and mixed content issues
            const response = await fetch(`https://contabilfacil-api.onrender.com/api/cnpj/${cleaned}`);
            const data = await response.json();

            if (response.ok) {
                setFormData(prev => ({
                    ...prev,
                    name: data.razao_social || data.nome_fantasia || '',
                    email: data.email || '',
                    phone: data.ddd_telefone_1 || '',
                    street: data.logradouro || '',
                    number: data.numero || '',
                    complement: data.complemento || '',
                    neighborhood: data.bairro || '',
                    city: data.municipio || '',
                    state: data.uf || ''
                }));
            } else {
                alert('CNPJ não encontrado ou erro na consulta.');
            }
        } catch (error) {
            console.error('Erro ao consultar CNPJ:', error);
            alert('Erro ao consultar API de CNPJ.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('https://contabilfacil-api.onrender.com/api/offices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Escritório cadastrado com sucesso!');
                setFormData({
                    name: '', cnpj: '', email: '', phone: '',
                    street: '', number: '', complement: '',
                    neighborhood: '', city: '', state: ''
                });
            } else {
                const err = await response.json();
                alert(`Erro: ${err.error || 'Erro ao cadastrar'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao conectar com o servidor.');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: 'var(--space-lg)' }}>Cadastrar Escritório</h2>

            <form onSubmit={handleSubmit} style={{
                backgroundColor: 'var(--bg-surface)',
                padding: 'var(--space-xl)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-md)'
            }}>

                {/* CNPJ Field (First) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label htmlFor="cnpj" style={{ fontWeight: 500, fontSize: '0.9rem' }}>CNPJ</label>
                        {loading && <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Consultando...</span>}
                    </div>
                    <input
                        type="text"
                        id="cnpj"
                        name="cnpj"
                        value={formData.cnpj}
                        onChange={handleChange}
                        onBlur={(e) => checkCnpj(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        required
                        style={{
                            padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontSize: '1rem',
                            backgroundColor: 'var(--bg-body)'
                        }}
                    />
                </div>

                {/* Office Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <label htmlFor="name" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Nome do Escritório</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{
                            padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontSize: '1rem',
                            backgroundColor: 'var(--bg-body)'
                        }}
                    />
                </div>

                {/* Contact Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        <label htmlFor="email" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem',
                                backgroundColor: 'var(--bg-body)'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        <label htmlFor="phone" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Telefone</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            style={{
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem',
                                backgroundColor: 'var(--bg-body)'
                            }}
                        />
                    </div>
                </div>

                {/* Address Section */}
                <h3 style={{ fontSize: '1rem', marginTop: 'var(--space-sm)', color: 'var(--text-muted)' }}>Endereço</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <label htmlFor="street" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Rua / Logradouro</label>
                    <input
                        type="text"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        required
                        style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem', backgroundColor: 'var(--bg-body)' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        <label htmlFor="number" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Número</label>
                        <input
                            type="text"
                            id="number"
                            name="number"
                            value={formData.number}
                            onChange={handleChange}
                            required
                            style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem', backgroundColor: 'var(--bg-body)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        <label htmlFor="complement" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Complemento</label>
                        <input
                            type="text"
                            id="complement"
                            name="complement"
                            value={formData.complement}
                            onChange={handleChange}
                            style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem', backgroundColor: 'var(--bg-body)' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.5fr', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        <label htmlFor="neighborhood" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Bairro</label>
                        <input
                            type="text"
                            id="neighborhood"
                            name="neighborhood"
                            value={formData.neighborhood}
                            onChange={handleChange}
                            required
                            style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem', backgroundColor: 'var(--bg-body)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        <label htmlFor="city" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Cidade</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem', backgroundColor: 'var(--bg-body)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        <label htmlFor="state" style={{ fontWeight: 500, fontSize: '0.9rem' }}>UF</label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            required
                            style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1rem', backgroundColor: 'var(--bg-body)' }}
                        />
                    </div>
                </div>

                <button type="submit" style={{
                    marginTop: 'var(--space-md)',
                    backgroundColor: 'var(--secondary)',
                    color: 'white',
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    transition: 'opacity 0.2s'
                }}>
                    Cadastrar Escritório
                </button>

            </form>
        </div>
    );
}
