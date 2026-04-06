// ─── DRE ─────────────────────────────────────────────────────────────────

export const linhasDRE = [
  { id: 'receita_bruta',       descricao: 'Receita Bruta',          mesAtual: 1612000, acumulado: 15856800, tipo: 'receita' },
  { id: 'deducoes',            descricao: 'Deduções',               mesAtual: -241800, acumulado: -2378520, tipo: 'despesa' },
  { id: 'receita_liquida',     descricao: 'Receita Líquida',        mesAtual: 1370200, acumulado: 13478280, tipo: 'subtotal' },
  { id: 'custos',              descricao: 'Custos dos Produtos',    mesAtual: -564200, acumulado: -5549880, tipo: 'custo' },
  { id: 'margem_bruta',        descricao: 'Margem Bruta',           mesAtual: 806000,  acumulado: 7928400,  tipo: 'subtotal' },
  { id: 'despesas_op',         descricao: 'Despesas Operacionais',  mesAtual: -362700, acumulado: -3568560, tipo: 'despesa' },
  { id: 'ebitda',              descricao: 'EBITDA',                 mesAtual: 443300,  acumulado: 4359840,  tipo: 'destaque' },
  { id: 'deprec_amort',        descricao: 'Deprec. e Amortização',  mesAtual: -48000,  acumulado: -480000,  tipo: 'despesa' },
  { id: 'resultado_liquido',   descricao: 'Resultado Líquido',      mesAtual: 395300,  acumulado: 3879840,  tipo: 'subtotal' },
]

export const waterfallData = [
  { name: 'Receita Bruta',       valor: 1612000, tipo: 'positivo' },
  { name: 'Deduções',            valor: -241800, tipo: 'negativo' },
  { name: 'Rec. Líquida',        valor: 1370200, tipo: 'subtotal' },
  { name: 'Custos',              valor: -564200, tipo: 'negativo' },
  { name: 'Margem Bruta',        valor: 806000,  tipo: 'subtotal' },
  { name: 'Desp. Operac.',       valor: -362700, tipo: 'negativo' },
  { name: 'EBITDA',              valor: 443300,  tipo: 'destaque' },
]

// ─── Projeção ────────────────────────────────────────────────────────────

export const dadosProjecaoBase = [
  { mes: 'Jan', realizado: 1210000, projetado: 1200000 },
  { mes: 'Fev', realizado: 1087000, projetado: 1220000 },
  { mes: 'Mar', realizado: 1342000, projetado: 1250000 },
  { mes: 'Abr', realizado: 1256000, projetado: 1280000 },
  { mes: 'Mai', realizado: 1398000, projetado: 1310000 },
  { mes: 'Jun', realizado: 1421000, projetado: 1340000 },
  { mes: 'Jul', realizado: 1289000, projetado: 1370000 },
  { mes: 'Ago', realizado: 1503000, projetado: 1400000 },
  { mes: 'Set', realizado: 1468000, projetado: 1430000 },
  { mes: 'Out', realizado: 1612000, projetado: 1460000 },
  { mes: 'Nov', realizado: null,    projetado: 1490000 },
  { mes: 'Dez', realizado: null,    projetado: 1520000 },
]

// ─── Custos / Extrato ────────────────────────────────────────────────────

export const categoriasDisponiveis = [
  'Folha de pagamento',
  'Aluguel',
  'Marketing',
  'Tecnologia',
  'Impostos',
  'Fornecedores',
  'Comissões',
  'Logística',
  'Utilidades',
  'Outros',
]

export const contasDisponiveis = [
  'Banco Principal',
  'Conta Operacional',
  'Conta Investimentos',
]

export const lancamentosMock = [
  { id: 1,  data: '2026-03-01', descricao: 'Salários e encargos',          valor: -185000, categoria: 'Folha de pagamento', conta: 'Banco Principal' },
  { id: 2,  data: '2026-03-02', descricao: 'Aluguel sede',                 valor: -22000,  categoria: 'Aluguel',            conta: 'Banco Principal' },
  { id: 3,  data: '2026-03-03', descricao: 'Recebimento cliente A',        valor: 312000,  categoria: 'Fornecedores',       conta: 'Conta Operacional' },
  { id: 4,  data: '2026-03-05', descricao: 'Google Ads e Meta Ads',        valor: -47000,  categoria: 'Marketing',          conta: 'Conta Operacional' },
  { id: 5,  data: '2026-03-07', descricao: 'Infraestrutura cloud',         valor: -18500,  categoria: 'Tecnologia',         conta: 'Conta Operacional' },
  { id: 6,  data: '2026-03-08', descricao: 'Recebimento cliente B',        valor: 189000,  categoria: 'Fornecedores',       conta: 'Banco Principal' },
  { id: 7,  data: '2026-03-10', descricao: 'ICMS / ISS / PIS / COFINS',   valor: -96400,  categoria: 'Impostos',           conta: 'Banco Principal' },
  { id: 8,  data: '2026-03-12', descricao: 'Comissões vendedores',         valor: -54300,  categoria: 'Comissões',          conta: 'Banco Principal' },
  { id: 9,  data: '2026-03-13', descricao: 'Recebimento cliente C',        valor: 245000,  categoria: 'Fornecedores',       conta: 'Conta Operacional' },
  { id: 10, data: '2026-03-15', descricao: 'Frete e logística',            valor: -31200,  categoria: 'Logística',          conta: 'Conta Operacional' },
  { id: 11, data: '2026-03-17', descricao: 'Energia / água / telecom',     valor: -8900,   categoria: 'Utilidades',         conta: 'Banco Principal' },
  { id: 12, data: '2026-03-18', descricao: 'Recebimento cliente D',        valor: 178000,  categoria: 'Fornecedores',       conta: 'Banco Principal' },
  { id: 13, data: '2026-03-20', descricao: 'Licenças de software',         valor: -12400,  categoria: 'Tecnologia',         conta: 'Conta Operacional' },
  { id: 14, data: '2026-03-22', descricao: 'Matéria-prima fornecedor X',   valor: -67800,  categoria: 'Fornecedores',       conta: 'Conta Operacional' },
  { id: 15, data: '2026-03-25', descricao: 'Recebimento cliente E',        valor: 156000,  categoria: 'Fornecedores',       conta: 'Conta Operacional' },
  { id: 16, data: '2026-03-27', descricao: 'Eventos corporativos',         valor: -9800,   categoria: 'Marketing',          conta: 'Conta Operacional' },
  { id: 17, data: '2026-03-28', descricao: 'Recebimento cliente F',        valor: 134500,  categoria: 'Fornecedores',       conta: 'Banco Principal' },
  { id: 18, data: '2026-03-30', descricao: 'Manutenção predial',           valor: -5200,   categoria: 'Outros',             conta: 'Banco Principal' },
]

export const caixaProjetado = [
  { mes: 'Jan', saldo: 420000 },
  { mes: 'Fev', saldo: 385000 },
  { mes: 'Mar', saldo: 462000 },
  { mes: 'Abr', saldo: 498000 },
  { mes: 'Mai', saldo: 534000 },
  { mes: 'Jun', saldo: 510000 },
  { mes: 'Jul', saldo: 487000 },
  { mes: 'Ago', saldo: 553000 },
  { mes: 'Set', saldo: 589000 },
  { mes: 'Out', saldo: 621000 },
  { mes: 'Nov', saldo: 598000 },
  { mes: 'Dez', saldo: 643000 },
]

// ─── Carteira de Clientes ────────────────────────────────────────────────

export const segmentos = ['Todos', 'Varejo', 'Indústria', 'Serviços', 'Tecnologia', 'Agro']

export const clientesCarteira = [
  { id: 1,  nome: 'Psi Corp S.A.',        segmento: 'Tecnologia', vendedorId: 6, vendedorNome: 'Lucas Andrade',        ultimaCompra: '2026-03-28', totalAcumulado: 924000, ticketMedio: 77000, frequenciaCompra: 12 },
  { id: 2,  nome: 'Omega Prime',           segmento: 'Serviços',   vendedorId: 6, vendedorNome: 'Lucas Andrade',        ultimaCompra: '2026-03-25', totalAcumulado: 732000, ticketMedio: 61000, frequenciaCompra: 11 },
  { id: 3,  nome: 'Grupo Alfa Ltda',       segmento: 'Varejo',     vendedorId: 1, vendedorNome: 'Ana Beatriz Lima',     ultimaCompra: '2026-03-22', totalAcumulado: 504000, ticketMedio: 42000, frequenciaCompra: 10 },
  { id: 4,  nome: 'Sigma Nordeste',        segmento: 'Indústria',  vendedorId: 5, vendedorNome: 'Juliana Ferreira',     ultimaCompra: '2026-03-30', totalAcumulado: 624000, ticketMedio: 52000, frequenciaCompra: 9 },
  { id: 5,  nome: 'Omega Comércio',        segmento: 'Varejo',     vendedorId: 2, vendedorNome: 'Carlos Eduardo Sousa', ultimaCompra: '2026-03-18', totalAcumulado: 660000, ticketMedio: 55000, frequenciaCompra: 11 },
  { id: 6,  nome: 'Kappa Energia',         segmento: 'Indústria',  vendedorId: 3, vendedorNome: 'Fernanda Rocha',       ultimaCompra: '2026-03-15', totalAcumulado: 576000, ticketMedio: 48000, frequenciaCompra: 8 },
  { id: 7,  nome: 'Omicron NE Corp',       segmento: 'Serviços',   vendedorId: 8, vendedorNome: 'Roberto Pinheiro',     ultimaCompra: '2026-03-20', totalAcumulado: 600000, ticketMedio: 50000, frequenciaCompra: 10 },
  { id: 8,  nome: 'Lambda Sul Ltda',       segmento: 'Varejo',     vendedorId: 7, vendedorNome: 'Mariana Costa',        ultimaCompra: '2026-03-12', totalAcumulado: 540000, ticketMedio: 45000, frequenciaCompra: 9 },
  { id: 9,  nome: 'Alpha Digital',         segmento: 'Tecnologia', vendedorId: 6, vendedorNome: 'Lucas Andrade',        ultimaCompra: '2026-03-26', totalAcumulado: 531600, ticketMedio: 44300, frequenciaCompra: 7 },
  { id: 10, nome: 'Tau Bahia Ltda',        segmento: 'Serviços',   vendedorId: 5, vendedorNome: 'Juliana Ferreira',     ultimaCompra: '2026-03-10', totalAcumulado: 495600, ticketMedio: 41300, frequenciaCompra: 8 },
  { id: 11, nome: 'Beta Distribuidora',    segmento: 'Varejo',     vendedorId: 1, vendedorNome: 'Ana Beatriz Lima',     ultimaCompra: '2026-03-14', totalAcumulado: 462000, ticketMedio: 38500, frequenciaCompra: 10 },
  { id: 12, nome: 'Pi Fortaleza',          segmento: 'Tecnologia', vendedorId: 8, vendedorNome: 'Roberto Pinheiro',     ultimaCompra: '2026-03-08', totalAcumulado: 507600, ticketMedio: 42300, frequenciaCompra: 7 },
  { id: 13, nome: 'Sigma Varejo',          segmento: 'Varejo',     vendedorId: 2, vendedorNome: 'Carlos Eduardo Sousa', ultimaCompra: '2026-02-28', totalAcumulado: 328000, ticketMedio: 41000, frequenciaCompra: 6 },
  { id: 14, nome: 'Lambda Serviços',       segmento: 'Serviços',   vendedorId: 3, vendedorNome: 'Fernanda Rocha',       ultimaCompra: '2026-03-05', totalAcumulado: 434400, ticketMedio: 36200, frequenciaCompra: 8 },
  { id: 15, nome: 'Mu RS Comércio',        segmento: 'Varejo',     vendedorId: 7, vendedorNome: 'Mariana Costa',        ultimaCompra: '2026-03-01', totalAcumulado: 296000, ticketMedio: 37000, frequenciaCompra: 5 },
  { id: 16, nome: 'Upsilon PE',            segmento: 'Tecnologia', vendedorId: 5, vendedorNome: 'Juliana Ferreira',     ultimaCompra: '2026-03-22', totalAcumulado: 271200, ticketMedio: 33900, frequenciaCompra: 4 },
  { id: 17, nome: 'Rho Recife Tech',       segmento: 'Tecnologia', vendedorId: 8, vendedorNome: 'Roberto Pinheiro',     ultimaCompra: '2026-03-18', totalAcumulado: 292800, ticketMedio: 36600, frequenciaCompra: 5 },
  { id: 18, nome: 'Xi Pecuária',           segmento: 'Agro',       vendedorId: 4, vendedorNome: 'Gabriel Martins',      ultimaCompra: '2026-02-20', totalAcumulado: 256000, ticketMedio: 32000, frequenciaCompra: 6 },
  { id: 19, nome: 'Nu Agronegócio',        segmento: 'Agro',       vendedorId: 3, vendedorNome: 'Fernanda Rocha',       ultimaCompra: '2026-03-02', totalAcumulado: 192000, ticketMedio: 19200, frequenciaCompra: 4 },
  { id: 20, nome: 'Rho Agro',              segmento: 'Agro',       vendedorId: 4, vendedorNome: 'Gabriel Martins',      ultimaCompra: '2026-01-15', totalAcumulado: 120000, ticketMedio: 10000, frequenciaCompra: 3 },
  { id: 21, nome: 'Gama Varejo S.A.',      segmento: 'Varejo',     vendedorId: 1, vendedorNome: 'Ana Beatriz Lima',     ultimaCompra: '2026-03-27', totalAcumulado: 350400, ticketMedio: 29200, frequenciaCompra: 7 },
  { id: 22, nome: 'Tau Logística',         segmento: 'Serviços',   vendedorId: 2, vendedorNome: 'Carlos Eduardo Sousa', ultimaCompra: '2026-03-11', totalAcumulado: 398400, ticketMedio: 33200, frequenciaCompra: 9 },
  { id: 23, nome: 'Omicron Madeiras',      segmento: 'Indústria',  vendedorId: 4, vendedorNome: 'Gabriel Martins',      ultimaCompra: '2026-02-10', totalAcumulado: 220000, ticketMedio: 27500, frequenciaCompra: 5 },
  { id: 24, nome: 'Mu Construções',        segmento: 'Indústria',  vendedorId: 3, vendedorNome: 'Fernanda Rocha',       ultimaCompra: '2026-03-06', totalAcumulado: 342000, ticketMedio: 28500, frequenciaCompra: 6 },
]
