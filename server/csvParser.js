const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Helper to clean numeric values
function limparNumero(valor) {
    return valor?.toString().replace(/\D/g, "");
}

// Helper to parse Brazilian currency string to number
function parseCurrency(str) {
    if (!str) return 0;
    // Remove "R$", spaces, dots, and replace comma with dot
    const clean = str.toString().replace(/[R$\s\.]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
}

// Helper to standard text normalization
function normalize(texto) {
    return texto?.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

async function processarPlanilhaBuffer(buffer) {
    const rawText = buffer.toString('utf-8');
    const lines = rawText.split(/\r?\n/);

    const employeesList = [];
    let dados = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(';');
        const content = parts.filter(item => item !== "");

        // A new "Ficha de Registro" usually starts with "Empregador" and "CNPJ", 
        // or we can use "Matrícula eSocial" as the start of a clear block.
        // For safety, let's treat "Empregador" as the boundary for a new employee sheet 
        // if `dados` already contains data.
        if (content.includes('Empregador') && content.includes('CNPJ')) {
            if (Object.keys(dados).length > 0 && dados.nome) {
                employeesList.push({ ...dados });
                dados = {}; // reset for next employee
            }
            const nextLine = lines[i + 1] ? lines[i + 1].split(';') : [];
            const lista = nextLine.filter(item => item !== "");
            dados.cnpj = lista[1] || null;
            continue;
        }

        if (content.includes('Matrícula eSocial')) {
            const nextLine = lines[i + 1] ? lines[i + 1].split(';') : [];
            const lista = nextLine.filter(item => item !== "");
            dados.matricula = lista[0] || null;
            dados.esocial = lista[1] || null;
            continue;
        }

        if (content.includes('Empregado') && content.includes('Beneficiários')) {
            const nextLine = lines[i + 1] ? lines[i + 1].split(';') : [];
            const lista = nextLine.filter(item => item !== "");
            dados.nome = lista[0] || null;
            continue;
        }

        if (content.includes('Data da saída')) {
            const nextLine = lines[i + 1] ? lines[i + 1].split(';') : [];
            const lista = nextLine.filter(item => item !== "");

            const saidaRaw = lista[lista.length - 1] ? lista[lista.length - 1].trim() : "";
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(saidaRaw)) {
                dados.data_saida = saidaRaw;
            } else {
                dados.data_saida = null;
            }
            continue;
        }

        if (content.includes('Residência')) {
            const nextLine = lines[i + 1] ? lines[i + 1].split(';') : null;
            if (nextLine) {
                const lista = nextLine.filter(item => item !== "")[0];
                if (lista) {
                    const endereco = lista.split(",");
                    const cepRaw = endereco[endereco.length - 1];
                    dados.cep = cepRaw ? limparNumero(cepRaw) : null;

                    const numeroRaw = endereco[1] ? endereco[1].trim() : '';
                    if (/^\d+$/.test(numeroRaw)) {
                        dados.numero = numeroRaw;
                    } else {
                        dados.numero = null;
                    }
                }
            }
            continue;
        }

        if (content.includes('Data de nascimento')) {
            const nextLine = lines[i + 1] ? lines[i + 1].split(';') : [];
            const lista = nextLine.filter(item => item !== "");
            dados.dataNascimento = lista[0] || null;
            dados.local_nascimento = lista[1] || null;
            dados.nacionalidade = lista[2] || null;
            dados.estado_civil = lista[3] || null;
            continue;
        }

        if (content.includes('Pai')) {
            const nextLine = lines[i + 1] ? lines[i + 1].split(';') : [];
            const lista = nextLine.filter(item => item !== "");
            dados.pai = lista[0] || null;
            continue;
        }

        if (content.includes('Mãe')) {
            const nextLine = lines[i + 1] ? lines[i + 1].split(';') : [];
            const lista = nextLine.filter(item => item !== "");
            dados.mae = lista[0] || null;
            continue;
        }

        if (content.includes('CTPS')) {
            const nextLine = lines[i + 1] ? lines[i + 1].split(';') : [];
            const lista = nextLine.filter(item => item !== "");
            dados.ctps = lista[0] || null;
            dados.serie_ctps = lista[1] || null;
            dados.data_emissao_ctps = lista[2] || null;
            dados.uf_ctps = lista[3] || null;

            const match9Digits = lista[4] ? lista[4].match(/\d{9}/) : null;
            if (match9Digits) {
                dados.cpf = match9Digits[0];
            } else {
                dados.cpf = lista[4] || null;
            }
            continue;
        }

        if (content.includes('Cargo')) {
            const nextLine = lines[i + 1] ? lines[i + 1].split(';') : [];
            const lista = nextLine.filter(item => item !== "");
            dados.cargo = lista[0] || null;
            dados.cbo = lista[1] || null;
            continue;
        }

        if (content.includes('Salário')) {
            const nextLine = lines[i + 1] ? lines[i + 1].split(';') : [];
            const lista = nextLine.filter(item => item !== "");

            let dataRaw = lista[0] ? lista[0].trim() : "";
            if (/^\d{4}-\d{2}-\d{2}/.test(dataRaw)) {
                const p = dataRaw.split(' ')[0].split('-');
                dados.admissao = `${p[2]}/${p[1]}/${p[0]}`;
            } else if (dataRaw && !/^\d{2}\/\d{2}\/\d{4}$/.test(dataRaw)) {
                const d = new Date(dataRaw);
                if (!isNaN(d.getTime())) {
                    const dia = String(d.getUTCDate()).padStart(2, '0');
                    const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
                    const ano = d.getUTCFullYear();
                    dados.admissao = `${dia}/${mes}/${ano}`;
                } else {
                    dados.admissao = dataRaw;
                }
            } else {
                dados.admissao = dataRaw;
            }
            dados.salario = lista[2] || null;

            const extractTimes = (str) => {
                if (!str) return null;
                const matches = str.match(/(\d{2}:\d{2})/g);
                if (matches && matches.length >= 2) {
                    return { inicio: matches[0], fim: matches[1] };
                }
                return null;
            };

            const horasParsed = extractTimes(lista[4]);
            if (horasParsed) {
                dados.hora_inicio = horasParsed.inicio;
                dados.hora_fim = horasParsed.fim;
            } else {
                dados.hora_trabalho_raw = lista[4] || null;
            }

            const intervaloParsed = extractTimes(lista[5]);
            if (intervaloParsed) {
                dados.intervalo_inicio = intervaloParsed.inicio;
                dados.intervalo_fim = intervaloParsed.fim;
            } else {
                dados.intervalo_raw = lista[5] || null;
            }
        }
    }

    // Push the very last employee processed at EOF
    if (Object.keys(dados).length > 0 && dados.nome) {
        employeesList.push({ ...dados });
    }

    // Process CEPs concurrently
    await Promise.all(employeesList.map(async (emp) => {
        if (emp.cep && emp.cep.length === 8) {
            try {
                const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${emp.cep}`);
                if (response.ok) {
                    const cepData = await response.json();
                    emp.endereco = cepData.street;
                    emp.bairro = cepData.neighborhood;
                    emp.cidade = cepData.city;
                    emp.estado = cepData.state;
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
    }));

    console.log(`[CSV PARSER] Extracted ${employeesList.length} employees.`);

    return employeesList.map(emp => ({
        nome: emp.nome || null,
        cpf: emp.cpf ? limparNumero(emp.cpf) : null,
        cargo: emp.cargo || null,
        cbo: emp.cbo || null,
        salario: emp.salario ? parseCurrency(emp.salario) : 0,
        dataAdmissao: emp.admissao || null,
        data_saida: emp.data_saida || null,
        internal_id: emp.matricula || null,
        esocial_registration: emp.esocial || null,
        cep: emp.cep || null,
        endereco: emp.endereco || null,
        numero: emp.numero || null,
        bairro: emp.bairro || null,
        cidade: emp.cidade || null,
        estado: emp.estado || null,
        cnpj: emp.cnpj || null,
        dataNascimento: emp.dataNascimento || null,
        local_nascimento: emp.local_nascimento || null,
        nacionalidade: emp.nacionalidade || null,
        estado_civil: emp.estado_civil || null,
        pai: emp.pai || null,
        mae: emp.mae || null,
        ctps: emp.ctps || null,
        serie_ctps: emp.serie_ctps || null,
        data_emissao_ctps: emp.data_emissao_ctps || null,
        uf_ctps: emp.uf_ctps || null,
        hora_inicio: emp.hora_inicio || null,
        hora_fim: emp.hora_fim || null,
        hora_trabalho_raw: emp.hora_trabalho_raw || null,
        intervalo_inicio: emp.intervalo_inicio || null,
        intervalo_fim: emp.intervalo_fim || null,
        intervalo_raw: emp.intervalo_raw || null
    }));
}

module.exports = {
    processarPlanilhaBuffer,
    limparNumero,
    parseCurrency,
    normalize
};
