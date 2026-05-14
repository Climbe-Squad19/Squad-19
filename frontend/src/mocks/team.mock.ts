import type { ClientCompany, TeamFocus, TeamMember } from '../types';

export const teamMembers: TeamMember[] = [
  {
    name: 'Marcos Paulo',
    role: 'Administrador',
    status: 'Online',
    email: 'marcos.paulo@climb.com.br',
    phone: '(79) 99999-1234',
    cpf: '123.456.789-00',
    permissions: ['Gerenciar Equipe', 'Aprovar Proposta', 'Gerenciar Empresas'],
  },
  {
    name: 'Ana Clara',
    role: 'Consultora financeira',
    status: 'Em reunião',
    email: 'ana.clara@climb.com.br',
    phone: '(79) 98888-7721',
    cpf: '987.654.321-00',
    permissions: ['Validar Documentos', 'Ver Relatórios'],
  },
  {
    name: 'Rafael Nunes',
    role: 'Analista de contratos',
    status: 'Online',
    email: 'rafael.nunes@climb.com.br',
    phone: '(79) 97777-5566',
    cpf: '456.123.789-10',
    permissions: ['Criar Contrato', 'Agendar Reuniões', 'Validar Documentos'],
  },
  {
    name: 'Juliana Mota',
    role: 'Relacionamento com clientes',
    status: 'Offline',
    email: 'juliana.mota@climb.com.br',
    phone: '(79) 96666-3344',
    cpf: '654.987.321-22',
    permissions: ['Agendar Reuniões', 'Gerenciar Empresas'],
  },
];

export const clientCompanies: ClientCompany[] = [
  {
    name: 'Jotanunes Construtora',
    document: '12.345.678/0001-99',
    status: 'Ativa',
    statusSince: 'desde 02/03/2026',
    tags: ['BPO', 'Valuation'],
  },
  {
    name: 'Universidade Tiradentes',
    document: '98.765.432/0001-11',
    status: 'Ativa',
    statusSince: 'desde 02/03/2026',
    tags: ['BPO'],
  },
  {
    name: 'Empresa X',
    document: 'xx.xxx.xxx/xxxx-xx',
    status: 'Inativa',
    statusSince: 'desde 02/03/2026',
    tags: ['Financeiro', 'Valuation'],
  },
  {
    name: 'Empresa Y',
    document: 'xx.xxx.xxx/xxxx-xx',
    status: 'Inativa',
    statusSince: 'desde 02/03/2026',
    tags: ['Financeiro'],
  },
  {
    name: 'Empresa A',
    document: 'xx.xxx.xxx/xxxx-xx',
    status: 'Ativa',
    statusSince: 'desde 02/03/2026',
    tags: ['Valuation'],
  },
  {
    name: 'Empresa B',
    document: 'xx.xxx.xxx/xxxx-xx',
    status: 'Ativa',
    statusSince: 'desde 02/03/2026',
    tags: ['BPO'],
  },
];

export const teamFocuses: TeamFocus[] = [
  { title: 'Operação financeira', detail: 'Distribuição do atendimento BPO e rotinas críticas.' },
  { title: 'Relacionamento com clientes', detail: 'Follow-up comercial e agenda estratégica da semana.' },
  { title: 'Contratos e documentos', detail: 'Controle de revisões, assinaturas e pendências.' },
];