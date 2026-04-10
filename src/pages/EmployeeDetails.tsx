import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EmployeeDetails() {
    const { clientId, employeeId } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dados');

    useEffect(() => {
        if (employeeId) {
            fetchEmployee();
        }
    }, [employeeId]);

    const fetchEmployee = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://contabilfacil-api.onrender.com/api/employees/${employeeId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    alert("Funcionário não encontrado.");
                    navigate(`/portal/client/${clientId}/employees`);
                    return;
                }
                throw new Error('Falha ao buscar funcionário');
            }
            const data = await response.json();
            setEmployee(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">Funcionário não encontrado.</p>
                <button
                    onClick={() => navigate(`/portal/client/${clientId}/employees`)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Voltar para lista
                </button>
            </div>
        );
    }

    // Handle admission date formatting
    const formattedAdmissionDate = employee.admission_date
        ? (typeof employee.admission_date === 'number' && employee.admission_date > 20000
            ? new Date((employee.admission_date - 25569) * 86400 * 1000).toLocaleDateString()
            : new Date(employee.admission_date).toLocaleDateString())
        : '-';



    return (
        <div className="space-y-6">
            {/* Header section with back button */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/portal/client/${clientId}/employees`)}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Voltar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{employee.name}</h2>
                        <p className="text-slate-500 text-sm">Funcionário #{employee.id} • CPF: {employee.cpf}</p>
                    </div>
                </div>

                {employee.status === 'active' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                        Ativo
                    </span>
                ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium border border-red-200">
                        Inativo
                    </span>
                )}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 overflow-x-auto">
                    {[
                        { id: 'dados', label: 'Dados do Funcionário' },
                        { id: 'ferias', label: 'Férias' },
                        { id: 'demissao', label: 'Demissão' },
                        { id: 'documentos', label: 'Documentos' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* DADOS TAB */}
                    {activeTab === 'dados' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Informações Pessoais */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Informações Pessoais</h3>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome Completo</label>
                                        <p className="font-medium text-slate-900">{employee.name || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CPF</label>
                                        <p className="font-medium text-slate-900">{employee.cpf || '-'}</p>
                                    </div>
                                </div>

                                {/* Informações Contratuais */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Informações Contratuais</h3>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cargo</label>
                                        <p className="font-medium text-slate-900">{employee.role || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data de Admissão</label>
                                        <p className="font-medium text-slate-900">{formattedAdmissionDate}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Salário Base</label>
                                        <p className="font-medium text-slate-900">
                                            {employee.salary
                                                ? employee.salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                                : 'R$ 0,00'}
                                        </p>
                                    </div>
                                </div>

                                {/* Informações de Sistema */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Sistema e eSocial</h3>

                                    <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nº Sistema (Domínio)</label>
                                        <p className="font-mono font-medium text-slate-900">{employee.internal_id || 'Não informado'}</p>
                                    </div>

                                    <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Matrícula eSocial</label>
                                        <p className="font-mono font-medium text-slate-900">{employee.esocial_registration || 'Não informado'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FÉRIAS TAB */}
                    {activeTab === 'ferias' && (
                        <div className="text-center py-16 animate-in fade-in duration-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Programação de Férias</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-6">Módulo para cálculo de período aquisitivo, simulação e agendamento de férias em desenvolvimento.</p>
                            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors">
                                Notificar quando disponível
                            </button>
                        </div>
                    )}

                    {/* DEMISSÃO TAB */}
                    {activeTab === 'demissao' && (
                        <div className="text-center py-16 animate-in fade-in duration-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Processo de Demissão</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-6">Módulo para cálculo de rescisão, geração de GRRF e aviso prévio em desenvolvimento.</p>
                            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors">
                                Notificar quando disponível
                            </button>
                        </div>
                    )}

                    {/* DOCUMENTOS TAB */}
                    {activeTab === 'documentos' && (
                        <div className="text-center py-16 animate-in fade-in duration-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Documentos do Funcionário</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-6">Módulo para visualizar holerites, recibos de férias, atestados e contratos em desenvolvimento.</p>
                            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors">
                                Notificar quando disponível
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
