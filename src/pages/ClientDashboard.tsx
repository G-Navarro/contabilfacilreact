import { useState, useEffect } from 'react';
import { useParams, Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function ClientDashboard() {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [client, setClient] = useState<any>(null);

    // Get current office user
    const user = JSON.parse(localStorage.getItem('office_user') || '{}');

    useEffect(() => {
        // Fetch client details to show header
        if (clientId && user.office_id) {
            fetch(`https://contabilfacil-api.onrender.com/api/portal/${user.office_id}/clients`)
                .then(res => res.json())
                .then(data => {
                    const found = data.find((c: any) => c.id === parseInt(clientId));
                    if (found) setClient(found);
                })
                .catch(err => console.error(err));
        }
    }, [clientId, user.office_id]);

    if (!client) return <div>Carregando cliente...</div>;

    const tabs = [
        { label: 'Visão Geral', path: '' },
        { label: 'Funcionários', path: 'employees' },
        { label: 'Notas Fiscais', path: 'invoices' },
        { label: 'Tarefas', path: 'tasks' },
        { label: 'Faturamento', path: 'billings' },
        { label: 'Configurações', path: 'settings' },
    ];

    const currentPath = location.pathname.split('/').pop();
    // primitive check for index route
    const isIndex = location.pathname.endsWith(`/client/${clientId}`);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/portal/clients')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 text-sm font-medium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Voltar para Lista
                </button>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{client.name}</h1>
                <p className="text-slate-500 mt-1">CNPJ: {client.cnpj}</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
                {tabs.map(tab => {
                    const isActive = tab.path === '' ? isIndex : currentPath === tab.path;
                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={`whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors border-b-2 ${isActive
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="bg-transparent">
                <Outlet context={{ client }} />
            </div>
        </div>
    );
}
