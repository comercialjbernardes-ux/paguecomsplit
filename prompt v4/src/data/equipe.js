export const vendedores = [
  { id: 1, nome: 'Ana Beatriz Lima', regiao: 'Sul', avatar: 'AB', faturamentoMensal: 187400, metaMensal: 160000, faturamentoAcumulado: 1823400, metaAcumulada: 1600000, variacaoMes: 12.4, comissaoBase: 3.5, bonus: 1.5 },
  { id: 2, nome: 'Carlos Eduardo Sousa', regiao: 'Sudeste', avatar: 'CE', faturamentoMensal: 162300, metaMensal: 180000, faturamentoAcumulado: 1521000, metaAcumulada: 1800000, variacaoMes: -5.2, comissaoBase: 3.5, bonus: 1.5 },
  { id: 3, nome: 'Fernanda Rocha', regiao: 'Centro-Oeste', avatar: 'FR', faturamentoMensal: 143700, metaMensal: 150000, faturamentoAcumulado: 1389000, metaAcumulada: 1500000, variacaoMes: 3.8, comissaoBase: 3.0, bonus: 1.5 },
  { id: 4, nome: 'Gabriel Martins', regiao: 'Norte', avatar: 'GM', faturamentoMensal: 98500, metaMensal: 140000, faturamentoAcumulado: 876000, metaAcumulada: 1400000, variacaoMes: -8.1, comissaoBase: 3.0, bonus: 1.5 },
  { id: 5, nome: 'Juliana Ferreira', regiao: 'Nordeste', avatar: 'JF', faturamentoMensal: 175200, metaMensal: 170000, faturamentoAcumulado: 1672000, metaAcumulada: 1700000, variacaoMes: 6.3, comissaoBase: 3.5, bonus: 1.5 },
  { id: 6, nome: 'Lucas Andrade', regiao: 'Sudeste', avatar: 'LA', faturamentoMensal: 211800, metaMensal: 200000, faturamentoAcumulado: 2015000, metaAcumulada: 2000000, variacaoMes: 9.7, comissaoBase: 4.0, bonus: 2.0 },
  { id: 7, nome: 'Mariana Costa', regiao: 'Sul', avatar: 'MC', faturamentoMensal: 134600, metaMensal: 160000, faturamentoAcumulado: 1241000, metaAcumulada: 1600000, variacaoMes: -2.4, comissaoBase: 3.0, bonus: 1.5 },
  { id: 8, nome: 'Roberto Pinheiro', regiao: 'Nordeste', avatar: 'RP', faturamentoMensal: 156900, metaMensal: 150000, faturamentoAcumulado: 1498000, metaAcumulada: 1500000, variacaoMes: 4.5, comissaoBase: 3.5, bonus: 1.5 },
]

export const carteiraPorVendedor = {
  1: {
    produtos: [
      { produto: 'Plano Empresarial Plus', valorVendido: 74200, pctComissao: 4.0 },
      { produto: 'Licença SaaS Anual', valorVendido: 58600, pctComissao: 3.5 },
      { produto: 'Suporte Premium', valorVendido: 31800, pctComissao: 3.0 },
      { produto: 'Módulo Analytics', valorVendido: 22800, pctComissao: 3.5 },
    ],
    clientes: [
      { nome: 'Grupo Alfa Ltda', cidade: 'Curitiba', volumeMensal: 42000, status: 'ativo' },
      { nome: 'Beta Distribuidora', cidade: 'Porto Alegre', volumeMensal: 38500, status: 'ativo' },
      { nome: 'Gama Varejo S.A.', cidade: 'Florianópolis', volumeMensal: 29200, status: 'novo' },
      { nome: 'Delta Ind. e Com.', cidade: 'Joinville', volumeMensal: 21700, status: 'ativo' },
      { nome: 'Épsilon Tech', cidade: 'Blumenau', volumeMensal: 18900, status: 'em risco' },
      { nome: 'Zeta Solutions', cidade: 'Caxias do Sul', volumeMensal: 14100, status: 'ativo' },
    ],
  },
  2: {
    produtos: [
      { produto: 'Plano Starter', valorVendido: 51000, pctComissao: 3.0 },
      { produto: 'Integração API', valorVendido: 48300, pctComissao: 4.0 },
      { produto: 'Consultoria On-site', valorVendido: 37200, pctComissao: 3.5 },
      { produto: 'Módulo CRM', valorVendido: 25800, pctComissao: 3.5 },
    ],
    clientes: [
      { nome: 'Omega Comércio', cidade: 'São Paulo', volumeMensal: 55000, status: 'ativo' },
      { nome: 'Sigma Varejo', cidade: 'Campinas', volumeMensal: 41000, status: 'em risco' },
      { nome: 'Tau Logística', cidade: 'Santos', volumeMensal: 33200, status: 'ativo' },
      { nome: 'Upsilon Digital', cidade: 'Ribeirão Preto', volumeMensal: 19100, status: 'novo' },
      { nome: 'Phi Indústria', cidade: 'São José dos Campos', volumeMensal: 14000, status: 'ativo' },
    ],
  },
  3: {
    produtos: [
      { produto: 'Plano Corporativo', valorVendido: 62400, pctComissao: 3.5 },
      { produto: 'Treinamento Equipe', valorVendido: 38700, pctComissao: 2.5 },
      { produto: 'Licença Desktop', valorVendido: 27600, pctComissao: 3.0 },
      { produto: 'Suporte Básico', valorVendido: 15000, pctComissao: 2.0 },
    ],
    clientes: [
      { nome: 'Kappa Energia', cidade: 'Brasília', volumeMensal: 48000, status: 'ativo' },
      { nome: 'Lambda Serviços', cidade: 'Goiânia', volumeMensal: 36200, status: 'ativo' },
      { nome: 'Mu Construções', cidade: 'Campo Grande', volumeMensal: 28500, status: 'em risco' },
      { nome: 'Nu Agronegócio', cidade: 'Cuiabá', volumeMensal: 19200, status: 'novo' },
    ],
  },
  4: {
    produtos: [
      { produto: 'Plano Regional', valorVendido: 41200, pctComissao: 3.0 },
      { produto: 'Módulo Relatórios', valorVendido: 28500, pctComissao: 3.5 },
      { produto: 'Suporte Remoto', valorVendido: 18800, pctComissao: 2.5 },
      { produto: 'Consultoria Online', valorVendido: 10000, pctComissao: 2.5 },
    ],
    clientes: [
      { nome: 'Xi Pecuária', cidade: 'Manaus', volumeMensal: 32000, status: 'ativo' },
      { nome: 'Omicron Madeiras', cidade: 'Belém', volumeMensal: 27500, status: 'em risco' },
      { nome: 'Pi Mineração', cidade: 'Porto Velho', volumeMensal: 21000, status: 'ativo' },
      { nome: 'Rho Agro', cidade: 'Macapá', volumeMensal: 10000, status: 'novo' },
    ],
  },
  5: {
    produtos: [
      { produto: 'Plano Empresarial Plus', valorVendido: 68400, pctComissao: 4.0 },
      { produto: 'Licença SaaS Anual', valorVendido: 52800, pctComissao: 3.5 },
      { produto: 'Módulo Analytics', valorVendido: 34000, pctComissao: 3.5 },
      { produto: 'Suporte Premium', valorVendido: 20000, pctComissao: 3.0 },
    ],
    clientes: [
      { nome: 'Sigma Nordeste', cidade: 'Fortaleza', volumeMensal: 52000, status: 'ativo' },
      { nome: 'Tau Bahia Ltda', cidade: 'Salvador', volumeMensal: 41300, status: 'ativo' },
      { nome: 'Upsilon PE', cidade: 'Recife', volumeMensal: 33900, status: 'novo' },
      { nome: 'Phi NE Comércio', cidade: 'Natal', volumeMensal: 24000, status: 'ativo' },
      { nome: 'Chi Maceió Tech', cidade: 'Maceió', volumeMensal: 16000, status: 'em risco' },
    ],
  },
  6: {
    produtos: [
      { produto: 'Plano Enterprise', valorVendido: 92000, pctComissao: 4.5 },
      { produto: 'Integração Full Stack', valorVendido: 58400, pctComissao: 4.0 },
      { produto: 'Licença SaaS Anual', valorVendido: 38200, pctComissao: 3.5 },
      { produto: 'Módulo BI', valorVendido: 23200, pctComissao: 4.0 },
    ],
    clientes: [
      { nome: 'Psi Corp S.A.', cidade: 'São Paulo', volumeMensal: 78000, status: 'ativo' },
      { nome: 'Omega Prime', cidade: 'Rio de Janeiro', volumeMensal: 61000, status: 'ativo' },
      { nome: 'Alpha Digital', cidade: 'Belo Horizonte', volumeMensal: 44300, status: 'ativo' },
      { nome: 'Beta Analytics', cidade: 'Vitória', volumeMensal: 16500, status: 'novo' },
      { nome: 'Gamma Fintech', cidade: 'Niterói', volumeMensal: 12000, status: 'em risco' },
    ],
  },
  7: {
    produtos: [
      { produto: 'Plano Empresarial', valorVendido: 54000, pctComissao: 3.5 },
      { produto: 'Suporte Premium', valorVendido: 38200, pctComissao: 3.0 },
      { produto: 'Módulo CRM', valorVendido: 27400, pctComissao: 3.5 },
      { produto: 'Treinamento Equipe', valorVendido: 15000, pctComissao: 2.5 },
    ],
    clientes: [
      { nome: 'Lambda Sul Ltda', cidade: 'Curitiba', volumeMensal: 45000, status: 'ativo' },
      { nome: 'Mu RS Comércio', cidade: 'Porto Alegre', volumeMensal: 37000, status: 'em risco' },
      { nome: 'Nu Santa Cat.', cidade: 'Joinville', volumeMensal: 31600, status: 'ativo' },
      { nome: 'Xi PR Indústria', cidade: 'Londrina', volumeMensal: 21000, status: 'novo' },
    ],
  },
  8: {
    produtos: [
      { produto: 'Plano Regional Plus', valorVendido: 63500, pctComissao: 3.5 },
      { produto: 'Módulo Relatórios', valorVendido: 44200, pctComissao: 3.5 },
      { produto: 'Suporte Avançado', valorVendido: 31000, pctComissao: 3.0 },
      { produto: 'Consultoria On-site', valorVendido: 18200, pctComissao: 3.5 },
    ],
    clientes: [
      { nome: 'Omicron NE Corp', cidade: 'Salvador', volumeMensal: 50000, status: 'ativo' },
      { nome: 'Pi Fortaleza', cidade: 'Fortaleza', volumeMensal: 42300, status: 'ativo' },
      { nome: 'Rho Recife Tech', cidade: 'Recife', volumeMensal: 36600, status: 'novo' },
      { nome: 'Sigma João Pess.', cidade: 'João Pessoa', volumeMensal: 17000, status: 'em risco' },
      { nome: 'Tau Maceió', cidade: 'Maceió', volumeMensal: 11000, status: 'ativo' },
    ],
  },
}

export const dadosMensais = [
  { mes: 'Jan', realizado: 1210000, meta: 1200000 },
  { mes: 'Fev', realizado: 1087000, meta: 1200000 },
  { mes: 'Mar', realizado: 1342000, meta: 1300000 },
  { mes: 'Abr', realizado: 1256000, meta: 1300000 },
  { mes: 'Mai', realizado: 1398000, meta: 1350000 },
  { mes: 'Jun', realizado: 1421000, meta: 1350000 },
  { mes: 'Jul', realizado: 1289000, meta: 1400000 },
  { mes: 'Ago', realizado: 1503000, meta: 1400000 },
  { mes: 'Set', realizado: 1468000, meta: 1450000 },
  { mes: 'Out', realizado: 1612000, meta: 1500000 },
  { mes: 'Nov', realizado: 1270400, meta: 1500000 },
  { mes: 'Dez', realizado: 1270400, meta: 1560000 },
]

export const regioes = ['Todas', 'Sul', 'Sudeste', 'Centro-Oeste', 'Norte', 'Nordeste']

// Re-exporta da fonte centralizada para compatibilidade com imports existentes
export { calcularAtingimento, formatCurrency, formatCurrencyShort } from '../utils/formatters'
