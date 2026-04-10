import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ClientEmployees() {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<any[]>([]);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        if (clientId) {
            fetchEmployees();
        }
    }, [clientId]);

    const fetchEmployees = async () => {
        try {
            const response = await fetch(`https://contabilfacil-api.onrender.com/api/clients/${clientId}/employees`);
            if (!response.ok) {
                if (response.status === 404) {
                    alert("Erro 404: Endpoint não encontrado. Reinicie o servidor.");
                    return;
                }
                throw new Error('Falha ao buscar funcionários');
            }
            const data = await response.json();
            setEmployees(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteEmployee = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;
        try {
            const response = await fetch(`https://contabilfacil-api.onrender.com/api/employees/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchEmployees();
            } else {
                alert('Erro ao excluir funcionário');
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao excluir');
        }
    };

    const handleFileUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        setImporting(true);

        const endpoint = `https://contabilfacil-api.onrender.com/api/clients/${clientId}/upload-employees`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                alert(`Funcionário importado: ${data.employee.name} (${data.employee.role})`);
                fetchEmployees();
            } else {
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar arquivo.');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Funcionários</h2>
                <div className="flex gap-2">
                    <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors">
                        {importing ? 'Importando...' : '📥 Importar (CSV)'}
                        <input
                            type="file"
                            accept=".csv"
                            disabled={importing}
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                            }}
                        />
                    </label>
                </div>
            </div>

            {employees.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">Nenhum funcionário cadastrado. Importe uma ficha de registro para começar.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Cód. Domínio</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Matrícula eSocial</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Nome</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">CPF</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-sm text-slate-600">{emp.internal_id || '-'}</td>
                                    <td className="p-4 text-sm text-slate-600">{emp.esocial_registration || '-'}</td>
                                    <td className="p-4 font-medium text-slate-900">{emp.name || '-'}</td>
                                    <td className="p-4 text-sm text-slate-600">{emp.cpf || '-'}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => navigate(`/portal/client/${clientId}/employee/${emp.id}`)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                            >
                                                Detalhes
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEmployee(emp.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
