const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    attributeNamePrefix: "@_"
});

function processXmlBuffer(buffer) {
    const rawXml = buffer.toString('utf-8');
    let jsonObj;

    try {
        jsonObj = parser.parse(rawXml);
    } catch (e) {
        throw new Error('Falha ao interpretar arquivo XML. Formato inválido.');
    }

    // Default return structure
    const invoiceData = {
        xml_type: 'UNKNOWN',
        invoice_number: null,
        issue_date: null,
        provider_cnpj: null,
        provider_name: null,
        taker_cnpj: null,
        taker_name: null,
        total_value: 0,
        raw_data: JSON.stringify(jsonObj) // Keep a fallback of everything
    };

    // STRATEGY ROUTER

    // 1. National NF-e (Produtos)
    if (jsonObj.nfeProc && jsonObj.nfeProc.NFe && jsonObj.nfeProc.NFe.infNFe) {
        const infNFe = jsonObj.nfeProc.NFe.infNFe;
        invoiceData.xml_type = 'NF-E_NACIONAL';
        invoiceData.invoice_number = infNFe.ide?.nNF?.toString() || null;
        invoiceData.issue_date = infNFe.ide?.dhEmi || null;
        
        invoiceData.provider_cnpj = infNFe.emit?.CNPJ?.toString() || null;
        invoiceData.provider_name = infNFe.emit?.xNome || null;
        
        invoiceData.taker_cnpj = infNFe.dest?.CNPJ?.toString() || infNFe.dest?.CPF?.toString() || null;
        invoiceData.taker_name = infNFe.dest?.xNome || null;
        
        invoiceData.total_value = parseFloat(infNFe.total?.ICMSTot?.vNF || 0);
        return invoiceData;
    }

    // 2. NFS-e ABRASF Pattern (Often used by many municipalities)
    if (jsonObj.CompNfse && jsonObj.CompNfse.Nfse && jsonObj.CompNfse.Nfse.InfNfse) {
        const infNfse = jsonObj.CompNfse.Nfse.InfNfse;
        invoiceData.xml_type = 'NFS-E_ABRASF';
        invoiceData.invoice_number = infNfse.Numero?.toString() || null;
        invoiceData.issue_date = infNfse.DataEmissao || null;
        
        invoiceData.provider_cnpj = infNfse.PrestadorServico?.IdentificacaoPrestador?.Cnpj?.toString() || null;
        invoiceData.provider_name = infNfse.PrestadorServico?.RazaoSocial || null;
        
        invoiceData.taker_cnpj = infNfse.TomadorServico?.IdentificacaoTomador?.CpfCnpj?.Cnpj?.toString() 
                                 || infNfse.TomadorServico?.IdentificacaoTomador?.CpfCnpj?.Cpf?.toString() || null;
        invoiceData.taker_name = infNfse.TomadorServico?.RazaoSocial || null;
        
        invoiceData.total_value = parseFloat(infNfse.Servico?.Valores?.ValorServicos || 0);
        return invoiceData;
    }

    // 3. NFS-e Paulistana (São Paulo)
    // Structure: <NFe><Assinatura>...
    if (jsonObj.NFe && jsonObj.NFe.ChaveNFe) {
        const nfe = jsonObj.NFe;
        invoiceData.xml_type = 'NFS-E_PAULISTANA';
        invoiceData.invoice_number = nfe.ChaveNFe?.NumeroNFe?.toString() || null;
        // Paulistana dates are often in format YYYY-MM-DDTHH:MM:SS
        invoiceData.issue_date = nfe.DataEmissaoNFe || null; 

        invoiceData.provider_cnpj = nfe.CPFCNPJPrestador?.CNPJ?.toString() || nfe.CPFCNPJPrestador?.CPF?.toString() || null;
        invoiceData.provider_name = nfe.RazaoSocialPrestador || null;

        invoiceData.taker_cnpj = nfe.CPFCNPJTomador?.CNPJ?.toString() || nfe.CPFCNPJTomador?.CPF?.toString() || null;
        invoiceData.taker_name = nfe.RazaoSocialTomador || null;

        invoiceData.total_value = parseFloat(nfe.ValorServicos || 0);
        return invoiceData;
    }

    // If no pattern matches, it will return the UNKNOWN type with raw JSON fallback
    return invoiceData;
}

module.exports = {
    processXmlBuffer
};
