import { useOutletContext } from 'react-router-dom';

export default function ClientOverview() {
    const { client } = useOutletContext<any>();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Status Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:bg-emerald-100 transition-colors"></div>
                <h4 className="text-slate-600 font-medium mb-2">Status</h4>
                <div className="inline-flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <p className="text-emerald-600 font-bold text-lg">Ativo</p>
                </div>
            </div>

            {/* Contato Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-100 transition-colors"></div>
                <h4 className="text-slate-600 font-medium mb-4">Dados de Contato</h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-700">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <p className="font-medium">{client.email || 'Sem email'}</p>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <p className="font-medium">{client.phone || 'Sem telefone'}</p>
                    </div>
                </div>
            </div>

            {/* Ultima Atividade Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10 group-hover:bg-purple-100 transition-colors"></div>
                <h4 className="text-slate-600 font-medium mb-2">Última Atividade</h4>
                <p className="text-slate-900 font-medium mt-2">-</p>
                <p className="text-slate-500 text-sm mt-1">Apenas em visualização</p>
            </div>
        </div>
    );
}
