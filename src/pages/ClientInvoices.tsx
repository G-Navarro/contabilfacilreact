import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Invoice {
  id: number;
  xml_type: string;
  invoice_number: string;
  issue_date: string;
  provider_cnpj: string;
  provider_name: string;
  taker_cnpj: string;
  taker_name: string;
  total_value: number;
  raw_data: string;
}

export default function ClientInvoices() {
  const { clientId } = useParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://contabilfacil-api.onrender.com/api/clients/${clientId}/invoices`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (e) {
      console.error('Error fetching invoices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [clientId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
        formData.append('files', e.target.files[i]);
    }

    setUploading(true);
    setMessage('');

    try {
      const res = await fetch(`https://contabilfacil-api.onrender.com/api/clients/${clientId}/invoices/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Upload completo!');
        fetchInvoices(); // Refresh table
      } else {
        setMessage(data.error || 'Erro no upload.');
      }
    } catch (error) {
      setMessage('Erro de conexão ao enviar arquivos.');
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      try {
          // Attempt to format generic ISO
          return new Date(dateString).toLocaleDateString('pt-BR');
      } catch {
          return dateString;
      }
  }

  return (
    <div className="space-y-6 animate-fade-in custom-scrollbar">

      {/* Header and Upload Zone */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Notas Fiscais (XML)</h2>
        <div className="flex flex-col md:flex-row gap-6 items-start">
            
            <div className="flex-1 w-full relative">
                <label 
                htmlFor="xml-upload" 
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? 'bg-slate-50 border-slate-300' : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50'}`}
                >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="mb-2 text-sm text-slate-500"><span className="font-semibold text-blue-600">Clique</span> ou arraste arquivos XML ({uploading ? 'Enviando...' : 'Lote de Notas'})</p>
                </div>
                <input 
                    id="xml-upload" 
                    type="file" 
                    multiple 
                    accept=".xml" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                    disabled={uploading}
                />
                </label>
            </div>

            <div className="flex-1 w-full bg-slate-50 p-4 rounded-xl border border-slate-100 h-32 flex flex-col justify-center">
                <p className="text-sm text-slate-600 mb-2 font-medium">Status do Processamento:</p>
                {message ? (
                    <p className="text-sm font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-lg">{message}</p>
                ) : (
                    <p className="text-sm text-slate-400">Aguardando arquivos XML para importação massiva...</p>
                )}
            </div>

        </div>
      </div>

      {/* List of Invoices */}
      <div className="bg-white h-auto rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-semibold text-slate-800">Notas Importadas ({invoices.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Carregando notas fiscais...</div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nenhuma nota importada para este cliente.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Nº da Nota</th>
                  <th className="px-6 py-4 font-medium">Data Emissão</th>
                  <th className="px-6 py-4 font-medium">Padrão / Tipo</th>
                  <th className="px-6 py-4 font-medium">Prestador</th>
                  <th className="px-6 py-4 font-medium">Tomador</th>
                  <th className="px-6 py-4 font-medium text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                      {inv.invoice_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(inv.issue_date)}</td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {inv.xml_type}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]" title={inv.provider_name}>
                        <p className="font-medium text-xs">{inv.provider_cnpj}</p>
                        <p className="text-xs opacity-75 truncate">{inv.provider_name}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]" title={inv.taker_name}>
                        <p className="font-medium text-xs">{inv.taker_cnpj}</p>
                        <p className="text-xs opacity-75 truncate">{inv.taker_name}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {formatCurrency(inv.total_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
