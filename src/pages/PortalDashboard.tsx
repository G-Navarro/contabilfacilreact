import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PortalDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        clients: 0,
        pendingTasks: 0,
        pendingBilling: 0
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('office_user');
        if (!storedUser) {
            navigate('/portal/login');
            return;
        }

        const userData = JSON.parse(storedUser);
        setUser(userData);

        if (userData.office_id) {
            // Fetch Stats
            Promise.all([
                fetch(`https://contabilfacil-api.onrender.com/api/portal/${userData.office_id}/clients`).then(r => r.json()),
                fetch(`https://contabilfacil-api.onrender.com/api/portal/${userData.office_id}/tasks`).then(r => r.json()),
                fetch(`https://contabilfacil-api.onrender.com/api/portal/${userData.office_id}/billings`).then(r => r.json())
            ]).then(([clients, tasks, billings]) => {
                setStats({
                    clients: Array.isArray(clients) ? clients.length : 0,
                    pendingTasks: Array.isArray(tasks) ? tasks.filter((t: any) => t.status !== 'completed').length : 0,
                    pendingBilling: Array.isArray(billings) ? billings.length : 0 // Assuming all billings returned are relevant
                });
            }).catch(err => console.error('Failed to load stats', err));
        }

    }, [navigate]);

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Olá, {user.name}</h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Bem-vindo ao painel de gestão do escritório <span className="font-semibold text-slate-700">{user.officeName}</span>.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Clientes Ativos Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-100 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-slate-600 font-medium">Clientes Ativos</h4>
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-slate-900">{stats.clients}</p>
                </div>

                {/* Tarefas Pendentes Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-10 group-hover:bg-orange-100 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-slate-600 font-medium">Tarefas Pendentes</h4>
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-slate-900">{stats.pendingTasks}</p>
                </div>

                {/* Faturas Geradas Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:bg-emerald-100 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-slate-600 font-medium">Faturas Geradas</h4>
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-slate-900">{stats.pendingBilling}</p>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Ações Rápidas</h3>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => navigate('/portal/clients')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Gerenciar Clientes
                    </button>
                    <button
                        onClick={() => navigate('/portal/tasks')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-300 rounded-xl transition-all shadow-sm hover:shadow"
                    >
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Ver Tarefas
                    </button>
                </div>
            </div>
        </div>
    );
}
