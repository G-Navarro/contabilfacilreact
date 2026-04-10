import { useState, useEffect } from 'react';
import OfficeList from './OfficeList';

export default function Dashboard() {
    const [stats, setStats] = useState({ count: 0 });

    useEffect(() => {
        fetch('https://contabilfacil-api.onrender.com/api/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Failed to load stats:', err));
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-100 transition-colors"></div>

                <div className="max-w-3xl">
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Bem-vindo ao ContabilFacil</h3>
                    <p className="text-lg text-slate-500 mb-6">
                        Gerencie seus escritórios e acessos centralizados aqui.
                    </p>

                    <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <span className="text-xl">{stats.count}</span>
                        <span>Escritórios Ativos</span>
                    </div>
                </div>
            </div>

            <OfficeList />
        </div>
    );
}
