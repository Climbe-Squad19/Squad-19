import { FormEvent, MouseEvent, useEffect, useMemo, useState } from 'react';
import { Avatar, Divider, ListItemIcon, Menu, MenuItem as MuiMenuItem, Tooltip, Zoom } from '@mui/material';
import ProfileDrawer from '../components/ProfileDrawer';
import { fetchAgenda, fetchCalendar, createMeeting, fetchDashboardOverview, AgendaApiItem, CalendarApiDay } from '../services/dashboard';
import { createEmpresa, fetchEmpresas, EmpresaApiResponse } from '../services/empresas';
import { fetchUsuarios, UsuarioApiResponse } from '../services/usuarios';
import { fetchContratos, fetchDocumentosByEmpresa, fetchPropostas, fetchReunioes, PropostaApiResponse } from '../services/business';
import { fetchMinhasIntegracoes, getGoogleIntegrationAuthUrl, updateIntegracao } from '../services/integracoes';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateProfile } from '../store/profileSlice';
import { ActiveMenuItem, closeNotifications, openNotifications, setActiveMenuItem, toggleExpandedSection } from '../store/uiSlice';

interface DashboardProps {
  onLogout: () => void;
}

type MenuItem = {
  label: string;
  isLogout?: boolean;
};

type SummaryCard = {
  title: string;
  value: string;
  subtitle: string;
};

type ContractItem = {
  company: string;
  service: string;
  start: string;
};

type UpcomingItem = {
  client: string;
  reference: string;
  due: string;
  priority: 'Alta' | 'Média' | 'Baixa';
};

type TeamMember = {
  name: string;
  role: string;
  status: 'Online' | 'Em reunião' | 'Offline';
  email: string;
  phone: string;
  cpf: string;
  permissions: string[];
};

type ClientCompany = {
  id?: number;
  name: string;
  document: string;
  status: string;
  statusSince: string;
  tags: string[];
};

type ProposalCardItem = {
  company: string;
  tag: 'BPO' | 'Financeiro' | 'Valuation';
  amount: string;
  createdLabel: string;
};

type ProposalColumn = {
  title: string;
  items: ProposalCardItem[];
};

type AgendaViewMode = 'semanal' | 'mensal';

type CompanyDetailTab = 'Visão geral' | 'Propostas' | 'Contratos' | 'Documentos' | 'Reuniões' | 'Relatórios';

type CompanyProposal = {
  title: string;
  service: string;
  amount: string;
  status: string;
};

type CompanyContract = {
  code: string;
  service: string;
  startDate: string;
  status: string;
};

type CompanyDocument = {
  name: string;
  category: string;
  status: string;
};

type CompanyMeeting = {
  topic: string;
  date: string;
  channel: string;
};

type CompanyReport = {
  title: string;
  period: string;
  status: string;
};

type TeamFocus = {
  title: string;
  detail: string;
};

type SettingsSection = 'Meu Perfil' | 'Segurança' | 'Notificações' | 'Integrações';

type EntityActionModal = {
  title: string;
  subtitle: string;
  actionLabel: string;
  actionIcon: string;
  variant?: 'default' | 'download';
  details: Array<{ label: string; value: string }>;
  fileName?: string;
  fileContent?: string;
};

type NotificationFeedItem = {
  title: string;
  description: string;
  tone: 'accent' | 'neutral';
  channel: 'site' | 'email' | 'calendar';
  timeLabel: string;
};

const primaryMenuItems: MenuItem[] = [
  { label: 'Dashboard' },
  { label: 'Agenda' },
  { label: 'Propostas comerciais' },
  { label: 'Clientes / Empresas' }
];

const secondaryMenuItems: MenuItem[] = [{ label: 'Equipe' }];

const accountItems: MenuItem[] = [
  { label: 'Configurações' },
  { label: 'Sair', isLogout: true }
];

const defaultSummaryCards: SummaryCard[] = [
  { title: 'Propostas Pendentes', value: '3 propostas', subtitle: 'nos últimos 30 dias' },
  { title: 'Contratos Ativos', value: '10 contratos', subtitle: 'no último 30 dias' },
  { title: 'Documentos para Validação', value: '5 restantes', subtitle: 'de 3 empresas diferentes' },
  { title: 'Reuniões da Semana', value: '13 reuniões', subtitle: 'nos próximos 5 dias' }
];

const defaultRecentContracts: ContractItem[] = [
  { company: 'Universidade Tiradentes', service: 'BPO Financeiro', start: '08/03/2026 - 08:32h' },
  { company: 'JotaNunes Construtora', service: 'Análise Valuation', start: '05/03/2026 - 14:59h' },
  { company: 'Porto Digital', service: 'M&A', start: '23/02/2026 - 17:00h' }
];

const defaultUpcomingItems: UpcomingItem[] = [
  { client: 'Empresa X', reference: 'Entrega de balanço', due: 'em 3 dias', priority: 'Média' },
  { client: 'Unit', reference: 'Renovação de contrato', due: 'em 2 semanas', priority: 'Alta' },
  { client: 'Empresa Y', reference: 'Relatório', due: 'em 3 dias', priority: 'Baixa' }
];

const teamMembers: TeamMember[] = [
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
  }
];

const teamPermissionOptions = [
  'Aprovar Proposta',
  'Criar Contrato',
  'Validar Documentos',
  'Ver Relatórios',
  'Criar Relatórios',
  'Agendar Reuniões',
  'Gerenciar Equipe',
  'Gerenciar Empresas',
] as const;

const teamRoleOptions = [
  { value: 'CEO', label: 'CEO' },
  { value: 'CFO', label: 'CFO' },
  { value: 'CMO', label: 'CMO' },
  { value: 'CSO', label: 'CSO' },
  { value: 'COMPLIANCE', label: 'Compliance' },
  { value: 'MEMBRO_CONSELHO', label: 'Membro do Conselho' },
  { value: 'ANALISTA_TRAINEE', label: 'Analista Trainee' },
  { value: 'ANALISTA_JUNIOR', label: 'Analista Junior' },
  { value: 'ANALISTA_PLENO', label: 'Analista Pleno' },
  { value: 'ANALISTA_SENIOR', label: 'Analista Senior' },
  { value: 'ANALISTA_BPO', label: 'Analista BPO' },
] as const;

const clientCompanies: ClientCompany[] = [
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
  }
];

const initialProposalColumns: ProposalColumn[] = [
  {
    title: 'Rascunhos',
    items: [
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
    ],
  },
  {
    title: 'Aguardando Aprovação',
    items: [
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'BPO', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
    ],
  },
  {
    title: 'Em Revisão (Recusados)',
    items: [
      { company: 'Jota Nunes Construtora', tag: 'Financeiro', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Financeiro', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Financeiro', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Financeiro', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Financeiro', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
    ],
  },
  {
    title: 'Aceitas (Contratos gerados)',
    items: [
      { company: 'Jota Nunes Construtora', tag: 'Valuation', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Valuation', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Valuation', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Valuation', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
      { company: 'Jota Nunes Construtora', tag: 'Valuation', amount: 'R$ 12.000', createdLabel: 'criou há 20 dias atrás' },
    ],
  },
];

const companyDetailTabs: CompanyDetailTab[] = ['Visão geral', 'Propostas', 'Contratos', 'Documentos', 'Reuniões', 'Relatórios'];

const companyOverviewMetrics = [
  { label: 'Receita mensal', value: 'R$ 78.000' },
  { label: 'Contratos ativos', value: '04' },
  { label: 'Propostas abertas', value: '03' },
  { label: 'Pendências', value: '02' },
];

const companyProposals: CompanyProposal[] = [
  { title: 'Expansão BPO', service: 'BPO Financeiro', amount: 'R$ 12.000', status: 'Em análise' },
  { title: 'Valuation 2026', service: 'Valuation', amount: 'R$ 18.500', status: 'Aguardando aprovação' },
  { title: 'Diagnóstico Fiscal', service: 'Consultoria', amount: 'R$ 7.800', status: 'Rascunho' },
];

const companyContracts: CompanyContract[] = [
  { code: 'CTR-2026-001', service: 'BPO Financeiro', startDate: '03/01/2026', status: 'Ativo' },
  { code: 'CTR-2026-014', service: 'Valuation', startDate: '11/02/2026', status: 'Ativo' },
  { code: 'CTR-2025-104', service: 'Consultoria Estratégica', startDate: '15/10/2025', status: 'Renovação' },
];

const companyDocuments: CompanyDocument[] = [
  { name: 'Contrato social consolidado', category: 'Jurídico', status: 'Válido' },
  { name: 'Balanço patrimonial 2025', category: 'Financeiro', status: 'Pendente revisão' },
  { name: 'Procuração digital', category: 'Operacional', status: 'Válido' },
];

const companyMeetings: CompanyMeeting[] = [
  { topic: 'Kickoff mensal', date: '09/04/2026 - 09:00', channel: 'Sala 2' },
  { topic: 'Revisão de proposta', date: '12/04/2026 - 16:00', channel: 'Google Meet' },
  { topic: 'Alinhamento de contrato', date: '15/04/2026 - 11:00', channel: 'Sala 1' },
];

const companyReports: CompanyReport[] = [
  { title: 'Relatório executivo', period: 'Março 2026', status: 'Disponível' },
  { title: 'Resumo de indicadores', period: 'Q1 2026', status: 'Disponível' },
  { title: 'Pendências operacionais', period: 'Abril 2026', status: 'Em preparação' },
];

const teamFocuses: TeamFocus[] = [
  { title: 'Operação financeira', detail: 'Distribuição do atendimento BPO e rotinas críticas.' },
  { title: 'Relacionamento com clientes', detail: 'Follow-up comercial e agenda estratégica da semana.' },
  { title: 'Contratos e documentos', detail: 'Controle de revisões, assinaturas e pendências.' },
];

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayIso() {
  return formatLocalDate(new Date());
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile);
  const { activeMenuItem, expandedSection, notificationMessage, showNotifications } = useAppSelector((state) => state.ui);
  const [search, setSearch] = useState('');
  const [agendaItems, setAgendaItems] = useState<AgendaApiItem[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarApiDay[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayIso());
  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>(defaultSummaryCards);
  const [recentContracts, setRecentContracts] = useState<ContractItem[]>(defaultRecentContracts);
  const [upcomingItems, setUpcomingItems] = useState<UpcomingItem[]>(defaultUpcomingItems);
  const [formTitle, setFormTitle] = useState('Nova reunião');
  const [formTime, setFormTime] = useState('09:00');
  const [formPresencial, setFormPresencial] = useState(true);
  const [formLocation, setFormLocation] = useState('Sala 2');
  const [formLinkOnline, setFormLinkOnline] = useState('https://meet.google.com/abc-defg-hij');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<HTMLElement | null>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<HTMLElement | null>(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLightSurfaceMode, setIsLightSurfaceMode] = useState(false);
  const [agendaViewMode, setAgendaViewMode] = useState<AgendaViewMode>('semanal');
  const [showAgendaCreatePanel, setShowAgendaCreatePanel] = useState(false);
  const [companies, setCompanies] = useState<ClientCompany[]>(clientCompanies);
  const [members, setMembers] = useState<TeamMember[]>(teamMembers);
  const [selectedCompany, setSelectedCompany] = useState<ClientCompany | null>(null);
  const [showCompanyCreatePanel, setShowCompanyCreatePanel] = useState(false);
  const [companyDetailTab, setCompanyDetailTab] = useState<CompanyDetailTab>('Visão geral');
  const [companyFormName, setCompanyFormName] = useState('');
  const [companyFormDocument, setCompanyFormDocument] = useState('');
  const [companyFormTags, setCompanyFormTags] = useState('BPO');
  const [companyFormStatus, setCompanyFormStatus] = useState<'Ativa' | 'Inativa'>('Ativa');
  const [companyFormSubmitting, setCompanyFormSubmitting] = useState(false);
  const [companyFormError, setCompanyFormError] = useState('');
  const [proposalBoard, setProposalBoard] = useState<ProposalColumn[]>(initialProposalColumns);
  const [companyProposalsData, setCompanyProposalsData] = useState<CompanyProposal[]>(companyProposals);
  const [companyContractsData, setCompanyContractsData] = useState<CompanyContract[]>(companyContracts);
  const [companyDocumentsData, setCompanyDocumentsData] = useState<CompanyDocument[]>(companyDocuments);
  const [companyMeetingsData, setCompanyMeetingsData] = useState<CompanyMeeting[]>(companyMeetings);
  const [selectedProposalDetail, setSelectedProposalDetail] = useState<(ProposalCardItem & { stage: string }) | null>(null);
  const [entityActionModal, setEntityActionModal] = useState<EntityActionModal | null>(null);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('Meu Perfil');
  const [settingsName, setSettingsName] = useState(profile.fullName);
  const [settingsPhone, setSettingsPhone] = useState(profile.phone);
  const [settingsEmail, setSettingsEmail] = useState(profile.email);
  const [securityCurrentPassword, setSecurityCurrentPassword] = useState('');
  const [securityNewPassword, setSecurityNewPassword] = useState('');
  const [securityConfirmPassword, setSecurityConfirmPassword] = useState('');
  const [notificationsSystem, setNotificationsSystem] = useState(true);
  const [notificationsEmail, setNotificationsEmail] = useState(false);
  const [notificationsAlerts, setNotificationsAlerts] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState<NotificationFeedItem[]>([
    {
      title: 'Sistema operacional pronto',
      description: 'Acompanhe agenda, propostas e operação central em tempo real.',
      tone: 'accent',
      channel: 'site',
      timeLabel: 'agora',
    },
  ]);
  const [integrations, setIntegrations] = useState({
    googleDrive: true,
    googleCalendar: true,
    googleSheets: true,
    gmail: true,
  });
  const [integrationsLoading, setIntegrationsLoading] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [showTeamCreateModal, setShowTeamCreateModal] = useState(false);
  const [teamFormName, setTeamFormName] = useState('');
  const [teamFormCpf, setTeamFormCpf] = useState('');
  const [teamFormEmail, setTeamFormEmail] = useState('');
  const [teamFormPhone, setTeamFormPhone] = useState('');
  const [teamFormRole, setTeamFormRole] = useState<string>(teamRoleOptions[0].label);
  const [teamFormStatus, setTeamFormStatus] = useState<'Online' | 'Offline'>('Online');
  const [teamFormPermissions, setTeamFormPermissions] = useState<string[]>(['Validar Documentos']);
  const [teamFormError, setTeamFormError] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const mapEmpresaToCard = (empresa: EmpresaApiResponse): ClientCompany => ({
    id: empresa.id,
    name: empresa.razaoSocial,
    document: empresa.cnpj || 'Nao informado',
    status: empresa.ativa ? 'Ativa' : 'Inativa',
    statusSince: empresa.dataCadastro ? `desde ${new Date(empresa.dataCadastro).toLocaleDateString('pt-BR')}` : 'sem data',
    tags: ['BPO'],
  });

  const formatDueLabel = (rawDate: string) => {
    const target = new Date(rawDate);
    const today = new Date();
    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 'vence hoje';
    }
    if (diffDays === 1) {
      return 'em 1 dia';
    }
    return `em ${diffDays} dias`;
  };

  const getPriorityByDueDate = (rawDate: string): UpcomingItem['priority'] => {
    const target = new Date(rawDate);
    const today = new Date();
    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) {
      return 'Alta';
    }
    if (diffDays <= 10) {
      return 'Média';
    }
    return 'Baixa';
  };

  const formatCargoLabel = (cargo: string) =>
    cargo
      .toLowerCase()
      .split('_')
      .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ''))
      .join(' ');

  const mapUsuarioToTeamMember = (usuario: UsuarioApiResponse): TeamMember => ({
    name: usuario.nomeCompleto,
    role: formatCargoLabel(usuario.cargo),
    status: usuario.ativo ? 'Online' : 'Offline',
    email: usuario.email || 'sem-email@empresa.com',
    phone: usuario.telefone || '(00) 00000-0000',
    cpf: usuario.cpf || '000.000.000-00',
    permissions: [`Cargo: ${formatCargoLabel(usuario.cargo)}`],
  });

  const statusToProposalStage = (status: string) => {
    const normalized = status.toUpperCase();
    if (normalized === 'ELABORACAO') {
      return 'Rascunhos';
    }
    if (normalized === 'ENVIADA') {
      return 'Aguardando Aprovação';
    }
    if (normalized === 'RECUSADA') {
      return 'Em Revisão (Recusados)';
    }
    if (normalized === 'ACEITA') {
      return 'Aceitas (Contratos gerados)';
    }
    return 'Rascunhos';
  };

  const serviceTagFromText = (value: string): ProposalCardItem['tag'] => {
    const text = value.toLowerCase();
    if (text.includes('valuation')) {
      return 'Valuation';
    }
    if (text.includes('finance')) {
      return 'Financeiro';
    }
    return 'BPO';
  };

  const buildProposalColumns = (propostas: PropostaApiResponse[]): ProposalColumn[] => {
    const stages = ['Rascunhos', 'Aguardando Aprovação', 'Em Revisão (Recusados)', 'Aceitas (Contratos gerados)'];
    return stages.map((stage) => ({
      title: stage,
      items: propostas
        .filter((proposta) => statusToProposalStage(proposta.status) === stage)
        .map((proposta) => ({
          company: proposta.nomeEmpresa,
          tag: serviceTagFromText(proposta.servicoContratado || ''),
          amount: `R$ ${Number(proposta.valorMensal || 0).toLocaleString('pt-BR')}`,
          createdLabel: proposta.dataCriacao
            ? `criada em ${new Date(proposta.dataCriacao).toLocaleDateString('pt-BR')}`
            : 'criada recentemente',
        })),
    }));
  };

  const selectedMonth = selectedDate.slice(0, 7);
  const searchTerm = search.trim().toLowerCase();

  const firstName = useMemo(() => profile.fullName.split(' ')[0] ?? profile.fullName, [profile.fullName]);
  const userInitials = useMemo(
    () =>
      profile.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join(''),
    [profile.fullName]
  );

  const filteredContracts = recentContracts.filter((contract) => {
    if (!searchTerm) {
      return true;
    }

    return `${contract.company} ${contract.service}`.toLowerCase().includes(searchTerm);
  });

  const filteredUpcomingItems = upcomingItems.filter((item) => {
    if (!searchTerm) {
      return true;
    }

    return `${item.client} ${item.reference} ${item.priority}`.toLowerCase().includes(searchTerm);
  });

  const filteredAgendaItems = agendaItems.filter((item) => {
    if (!searchTerm) {
      return true;
    }

    return `${item.title} ${item.company} ${item.status}`.toLowerCase().includes(searchTerm);
  });

  const filteredTeamMembers = members.filter((member) => {
    if (!searchTerm) {
      return true;
    }

    return `${member.name} ${member.role} ${member.status}`.toLowerCase().includes(searchTerm);
  });

  const filteredCompanies = companies.filter((company) => {
    if (!searchTerm) {
      return true;
    }

    return `${company.name} ${company.document} ${company.status} ${company.tags.join(' ')}`.toLowerCase().includes(searchTerm);
  });

  const filteredProposalColumns = proposalBoard.map((column) => ({
    ...column,
    items: column.items.filter((item) => {
      if (!searchTerm) {
        return true;
      }

      return `${item.company} ${item.tag} ${item.amount}`.toLowerCase().includes(searchTerm);
    }),
  }));

  const visibleContracts = expandedSection === 'contracts' ? filteredContracts : filteredContracts.slice(0, 3);
  const visibleDueDates = expandedSection === 'dueDates' ? filteredUpcomingItems : filteredUpcomingItems.slice(0, 3);
  const visibleAgendaItems = expandedSection === 'agenda' ? filteredAgendaItems : filteredAgendaItems.slice(0, 3);
  const toolbarHighlights = [
    { label: 'Data ativa', value: selectedDate },
    { label: 'Agenda', value: `${filteredAgendaItems.length} evento(s)` },
    { label: 'Contratos', value: `${filteredContracts.length} item(ns)` },
    { label: 'Status', value: profile.status },
  ];

  const notificationItems = useMemo(() => {
    const operationalItems: NotificationFeedItem[] = [
      {
        title: 'Agenda do dia',
        description:
          filteredAgendaItems.length > 0
            ? `${filteredAgendaItems.length} compromisso(s) relacionado(s) ao filtro atual.`
            : 'Nenhum compromisso encontrado para o filtro atual.',
        tone: 'accent',
        channel: 'site',
        timeLabel: 'agora',
      },
      {
        title: 'Prazos próximos',
        description:
          filteredUpcomingItems.length > 0
            ? `${filteredUpcomingItems.length} prazo(s) com atenção nos próximos dias.`
            : 'Nenhum prazo crítico encontrado.',
        tone: 'neutral',
        channel: 'site',
        timeLabel: 'agora',
      },
      {
        title: 'Operação comercial',
        description: `${filteredProposalColumns.reduce((total, column) => total + column.items.length, 0)} proposta(s) visíveis no quadro atual.`,
        tone: 'neutral',
        channel: 'site',
        timeLabel: 'agora',
      },
    ];

    const highlighted = showNotifications && notificationMessage
      ? [{
          title: 'Atualização recente',
          description: notificationMessage,
          tone: 'accent' as const,
          channel: 'site' as const,
          timeLabel: 'agora',
        }]
      : [];

    return [...recentNotifications, ...highlighted, ...operationalItems].slice(0, 6);
  }, [
    filteredAgendaItems.length,
    filteredUpcomingItems.length,
    filteredProposalColumns,
    notificationMessage,
    recentNotifications,
    showNotifications,
  ]);

  useEffect(() => {
    async function loadData() {
      setLoadingCalendar(true);
      setLoadingAgenda(true);

      try {
        const calendar = await fetchCalendar(selectedMonth);
        setCalendarDays(calendar);
      } catch (error) {
        console.error('Erro ao carregar calendário', error);
      } finally {
        setLoadingCalendar(false);
      }

      try {
        const agenda = await fetchAgenda(selectedDate);
        setAgendaItems(agenda);
      } catch (error) {
        console.error('Erro ao carregar agenda', error);
      } finally {
        setLoadingAgenda(false);
      }
    }

    loadData();
  }, [selectedDate, selectedMonth]);

  useEffect(() => {
    async function loadOverview() {
      try {
        const overview = await fetchDashboardOverview();

        setSummaryCards([
          { title: 'Propostas Pendentes', value: `${overview.propostasPendentes} proposta(s)`, subtitle: 'aguardando ação' },
          { title: 'Contratos Ativos', value: `${overview.contratosAtivos} contrato(s)`, subtitle: 'status ativo' },
          { title: 'Documentos para Validação', value: `${overview.documentosPendentes} pendente(s)`, subtitle: 'aguardando validação' },
          { title: 'Reuniões da Semana', value: `${overview.reunioesSemana} reunião(ões)`, subtitle: 'nos próximos 7 dias' },
        ]);

        setRecentContracts(
          overview.ultimosContratos.map((item) => ({
            company: item.empresa,
            service: item.servico,
            start: new Date(item.dataCriacao).toLocaleString('pt-BR'),
          }))
        );

        setUpcomingItems(
          overview.proximosVencimentos.map((item) => ({
            client: item.empresa,
            reference: item.referencia,
            due: formatDueLabel(item.dataVencimento),
            priority: getPriorityByDueDate(item.dataVencimento),
          }))
        );
      } catch (error) {
        console.error('Erro ao carregar visão geral do dashboard', error);
      }
    }

    loadOverview();
  }, []);

  useEffect(() => {
    async function loadBusinessData() {
      try {
        const [propostas, contratos, reunioes] = await Promise.all([
          fetchPropostas(),
          fetchContratos(),
          fetchReunioes(),
        ]);

        setProposalBoard(buildProposalColumns(propostas));

        if (selectedCompany?.id) {
          const companyId = selectedCompany.id;
          setCompanyProposalsData(
            propostas
              .filter((item) => item.empresaId === companyId)
              .map((item) => ({
                title: item.servicoContratado || 'Proposta',
                service: item.servicoContratado || 'Serviço',
                amount: `R$ ${Number(item.valorMensal || 0).toLocaleString('pt-BR')}`,
                status: item.status,
              }))
          );

          setCompanyContractsData(
            contratos
              .filter((item) => item.empresaId === companyId)
              .map((item) => ({
                code: `CTR-${item.id}`,
                service: item.tipoServico || 'Serviço',
                startDate: item.dataInicio ? new Date(item.dataInicio).toLocaleDateString('pt-BR') : '-',
                status: item.status,
              }))
          );

          setCompanyMeetingsData(
            reunioes
              .filter((item) => item.empresaId === companyId)
              .map((item) => ({
                topic: item.pauta || 'Reunião',
                date: item.dataHora ? new Date(item.dataHora).toLocaleString('pt-BR') : '-',
                channel: item.presencial ? (item.sala || 'Presencial') : (item.linkOnline || 'Online'),
              }))
          );
        }
      } catch (error) {
        console.error('Erro ao carregar dados comerciais', error);
      }
    }

    loadBusinessData();
  }, [selectedCompany]);

  useEffect(() => {
    async function loadCompanyDocuments() {
      if (!selectedCompany?.id) {
        return;
      }

      try {
        const docs = await fetchDocumentosByEmpresa(selectedCompany.id);
        setCompanyDocumentsData(
          docs.map((doc) => ({
            name: doc.nomeArquivo || `Documento ${doc.id}`,
            category: doc.tipo || 'Documento',
            status: doc.status || 'PENDENTE',
          }))
        );
      } catch (error) {
        console.error('Erro ao carregar documentos da empresa', error);
        setCompanyDocumentsData([]);
      }
    }

    loadCompanyDocuments();
  }, [selectedCompany]);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const empresas = await fetchEmpresas();
        setCompanies(empresas.map(mapEmpresaToCard));
      } catch (error) {
        console.error('Erro ao carregar empresas', error);
      }
    }

    loadCompanies();
  }, []);

  useEffect(() => {
    async function loadUsers() {
      try {
        const usuarios = await fetchUsuarios();
        setMembers(usuarios.map(mapUsuarioToTeamMember));
      } catch (error) {
        console.error('Erro ao carregar equipe', error);
      }
    }

    loadUsers();
  }, []);

  useEffect(() => {
    async function loadIntegrations() {
      setIntegrationsLoading(true);
      try {
        const data = await fetchMinhasIntegracoes();
        setIntegrations(data);
      } catch (error) {
        console.error('Erro ao carregar integrações', error);
      } finally {
        setIntegrationsLoading(false);
      }
    }

    loadIntegrations();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('integration_success');
    const error = params.get('integration_error');
    if (success) {
      dispatch(openNotifications(`Integração ${success} conectada com sucesso.`));
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      dispatch(openNotifications(`Falha ao conectar integração: ${error}`));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [dispatch]);

  function formatMonthLabel(monthString: string) {
    const [year, month] = monthString.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  }

  function changeMonth(direction: 'prev' | 'next') {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + (direction === 'prev' ? -1 : 1), 1);
    setSelectedDate(formatLocalDate(date));
  }

  function handleMenuClick(item: MenuItem) {
    dispatch(setActiveMenuItem(item.label as ActiveMenuItem));
    dispatch(closeNotifications());
    setIsMobileSidebarOpen(false);

    if (item.label !== 'Clientes / Empresas') {
      setSelectedCompany(null);
      setCompanyDetailTab('Visão geral');
      setShowCompanyCreatePanel(false);
    }

    if (item.label !== 'Configurações') {
      setSettingsSection('Meu Perfil');
    }
  }

  function handleToolbarAction(action: 'settings') {
    dispatch(setActiveMenuItem('Configurações'));
    dispatch(closeNotifications());
    setIsMobileSidebarOpen(false);
  }

  function handleNotificationsOpen(event: MouseEvent<HTMLButtonElement>) {
    const agendaCount = filteredAgendaItems.length;
    dispatch(
      openNotifications(
        agendaCount > 0
          ? `Voce possui ${agendaCount} compromisso${agendaCount > 1 ? 's' : ''} relacionado${agendaCount > 1 ? 's' : ''} ao filtro atual.`
          : 'Nenhum compromisso encontrado para o filtro atual.'
      )
    );
    setNotificationsAnchor(event.currentTarget);
  }

  function handleNotificationsClose() {
    setNotificationsAnchor(null);
    dispatch(closeNotifications());
  }

  function pushNotification(item: Omit<NotificationFeedItem, 'timeLabel'>) {
    setRecentNotifications((current) => [
      {
        ...item,
        timeLabel: 'agora',
      },
      ...current,
    ].slice(0, 8));
  }

  function handleAccountNavigation(target: 'Configurações' | 'Sair') {
    setIsMobileSidebarOpen(false);

    if (target === 'Sair') {
      setShowLogoutConfirm(true);
      return;
    }

    dispatch(setActiveMenuItem('Configurações'));
  }

  function confirmLogout() {
    setShowLogoutConfirm(false);
    onLogout();
  }

  function cancelLogout() {
    setShowLogoutConfirm(false);
  }

  function openCompanyDetails(company: ClientCompany) {
    setSelectedCompany(company);
    setCompanyDetailTab('Visão geral');
    setShowCompanyCreatePanel(false);
  }

  function closeCompanyCreatePanel() {
    setShowCompanyCreatePanel(false);
    setCompanyFormError('');
  }

  function resetCompanyForm() {
    setCompanyFormName('');
    setCompanyFormDocument('');
    setCompanyFormTags('BPO');
    setCompanyFormStatus('Ativa');
    setCompanyFormError('');
  }

  function resetTeamForm() {
    setTeamFormName('');
    setTeamFormCpf('');
    setTeamFormEmail('');
    setTeamFormPhone('');
    setTeamFormRole(teamRoleOptions[0].label);
    setTeamFormStatus('Online');
    setTeamFormPermissions(['Validar Documentos']);
    setTeamFormError('');
  }

  function handleOpenCompanyCreatePanel() {
    setSelectedCompany(null);
    setShowCompanyCreatePanel(true);
    resetCompanyForm();
  }

  function handleOpenTeamCreateModal() {
    resetTeamForm();
    setShowTeamCreateModal(true);
  }

  function handleCloseTeamCreateModal() {
    setShowTeamCreateModal(false);
    setTeamFormError('');
  }

  function handleOpenProposalDetail(item: ProposalCardItem, stage: string) {
    setSelectedProposalDetail({ ...item, stage });
  }

  function openEntityActionPreview(modal: EntityActionModal) {
    setEntityActionModal(modal);
  }

  function closeEntityActionPreview() {
    setEntityActionModal(null);
  }

  function confirmEntityActionPreview() {
    if (!entityActionModal) {
      return;
    }

    if (entityActionModal.variant === 'download') {
      const blob = new Blob([entityActionModal.fileContent ?? entityActionModal.title], {
        type: 'text/plain;charset=utf-8',
      });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = entityActionModal.fileName ?? 'arquivo.txt';
      link.click();
      URL.revokeObjectURL(downloadUrl);
    }

    setEntityActionModal(null);
  }

  function handleSaveProfileSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!settingsName.trim() || !settingsEmail.trim() || !settingsPhone.trim()) {
      dispatch(openNotifications('Preencha nome, e-mail e telefone para salvar o perfil.'));
      return;
    }

    dispatch(
      updateProfile({
        ...profile,
        fullName: settingsName.trim(),
        email: settingsEmail.trim(),
        phone: settingsPhone.trim(),
      })
    );
    dispatch(openNotifications('Dados do perfil atualizados com sucesso.'));
    pushNotification({
      title: 'Perfil atualizado',
      description: 'Seus dados de conta foram atualizados com sucesso.',
      tone: 'neutral',
      channel: 'site',
    });
  }

  function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!securityCurrentPassword || !securityNewPassword || !securityConfirmPassword) {
      dispatch(openNotifications('Preencha todos os campos de senha.'));
      return;
    }

    if (securityNewPassword !== securityConfirmPassword) {
      dispatch(openNotifications('A confirmação da nova senha não confere.'));
      return;
    }

    setSecurityCurrentPassword('');
    setSecurityNewPassword('');
    setSecurityConfirmPassword('');
    dispatch(openNotifications('Senha atualizada com sucesso.'));
    pushNotification({
      title: 'Segurança atualizada',
      description: 'A senha da conta foi alterada com sucesso.',
      tone: 'neutral',
      channel: 'site',
    });
  }

  async function toggleIntegration(name: keyof typeof integrations) {
    const nextValue = !integrations[name];
    if (nextValue) {
      try {
        const authUrl = await getGoogleIntegrationAuthUrl(name);
        window.location.href = authUrl;
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao iniciar autenticação Google.';
        dispatch(openNotifications(message));
        window.alert(message);
        return;
      }
    }

    try {
      const saved = await updateIntegracao(name, nextValue);
      setIntegrations(saved);
      dispatch(openNotifications(`${name} ${nextValue ? 'conectado' : 'desconectado'} com sucesso.`));
    } catch (error) {
      setIntegrations((current) => ({
        ...current,
        [name]: !nextValue,
      }));
      const message = error instanceof Error ? error.message : 'Falha ao atualizar integração.';
      dispatch(openNotifications(message));
      window.alert(message);
    }
  }

  function toggleTeamPermission(permission: string) {
    setTeamFormPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  }

  function handleCreateTeamMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!teamFormName.trim() || !teamFormCpf.trim() || !teamFormEmail.trim() || !teamFormPhone.trim() || !teamFormRole.trim()) {
      setTeamFormError('Preencha todos os campos obrigatórios do colaborador.');
      return;
    }

    if (teamFormPermissions.length === 0) {
      setTeamFormError('Selecione pelo menos uma permissão.');
      return;
    }

    const newMember: TeamMember = {
      name: teamFormName.trim(),
      cpf: teamFormCpf.trim(),
      email: teamFormEmail.trim(),
      phone: teamFormPhone.trim(),
      role: teamFormRole.trim(),
      status: teamFormStatus,
      permissions: teamFormPermissions,
    };

    setMembers((current) => [newMember, ...current]);
    setShowTeamCreateModal(false);
    resetTeamForm();
  }

  function handleCreateCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTags = companyFormTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!companyFormName.trim() || !companyFormDocument.trim()) {
      setCompanyFormError('Preencha nome e documento da empresa.');
      return;
    }

    if (normalizedTags.length === 0) {
      setCompanyFormError('Informe pelo menos uma categoria.');
      return;
    }

    setCompanyFormSubmitting(true);
    createEmpresa({
      razaoSocial: companyFormName.trim(),
      nomeFantasia: companyFormName.trim(),
      cnpj: companyFormDocument.trim(),
      logradouro: 'Nao informado',
      numero: 'S/N',
      bairro: 'Nao informado',
      cidade: 'Nao informada',
      uf: 'SE',
      cep: '00000-000',
      telefone: '(79) 99999-9999',
      emailContato: 'contato@empresa.com',
      nomeRepresentante: 'Nao informado',
      cpfRepresentante: '000.000.000-00',
      contatoRepresentante: '(79) 99999-9999',
    })
      .then((empresaCriada) => {
        const company = mapEmpresaToCard(empresaCriada);
        company.tags = normalizedTags;
        setCompanies((current) => [company, ...current]);
        resetCompanyForm();
        setShowCompanyCreatePanel(false);
      })
      .catch((error: unknown) => {
        setCompanyFormError(error instanceof Error ? error.message : 'Nao foi possivel criar a empresa.');
      })
      .finally(() => {
        setCompanyFormSubmitting(false);
      });
  }

  function getAgendaWeekItems(dayIndex: number) {
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    return filteredAgendaItems.filter((_, index) => index % labels.length === dayIndex);
  }

  function handleViewReport() {
    const reportLines = [
      'Relatorio da dashboard',
      `Data de referencia: ${selectedDate}`,
      `Compromissos do dia: ${filteredAgendaItems.length}`,
      `Contratos exibidos: ${filteredContracts.length}`,
      `Vencimentos exibidos: ${filteredUpcomingItems.length}`,
      `Visao ativa: ${activeMenuItem}`,
    ];

    const blob = new Blob([reportLines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `relatorio-dashboard-${selectedDate}.txt`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  }

  function handleViewAll(section: 'contracts' | 'dueDates' | 'agenda') {
    dispatch(toggleExpandedSection(section));
  }

  async function handleCreateMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      await createMeeting({
        pauta: formTitle,
        empresaId: 1,
        contratoId: 1,
        dataHora: `${selectedDate}T${formTime}:00`,
        presencial: formPresencial,
        linkOnline: formPresencial ? '' : formLinkOnline,
        sala: formPresencial ? formLocation : '',
        participantesIds: [1],
      });

      const [calendar, agenda] = await Promise.all([
        fetchCalendar(selectedMonth),
        fetchAgenda(selectedDate),
      ]);

      setCalendarDays(calendar);
      setAgendaItems(agenda);
      setFormTitle('Nova reunião');
      setFormTime('09:00');
      setFormLocation('Sala 2');
      setFormLinkOnline('https://meet.google.com/abc-defg-hij');
      setShowAgendaCreatePanel(false);
      if (expandedSection !== 'agenda') {
        dispatch(toggleExpandedSection('agenda'));
      }
      dispatch(setActiveMenuItem('Agenda'));
      if (notificationsSystem) {
        pushNotification({
          title: 'Novo evento na agenda',
          description: `${formTitle} foi agendado para ${selectedDate} às ${formTime}.`,
          tone: 'accent',
          channel: 'site',
        });
      }
      if (notificationsEmail && integrations.gmail) {
        pushNotification({
          title: 'Confirmação por e-mail',
          description: `Confirmação do evento ${formTitle} marcada para envio ao e-mail principal.`,
          tone: 'neutral',
          channel: 'email',
        });
      }
      if (integrations.googleCalendar) {
        pushNotification({
          title: 'Sincronização com calendário',
          description: `${formTitle} preparado para sincronização com Google Calendar.`,
          tone: 'neutral',
          channel: 'calendar',
        });
      }
      dispatch(openNotifications(`Evento ${formTitle} criado com sucesso.`));
    } catch (error) {
      console.error('Erro ao criar reunião', error);
      setFormError('Não foi possível agendar a reunião.');
    } finally {
      setFormSubmitting(false);
    }
  }

  function handleProfileMenuOpen(event: MouseEvent<HTMLButtonElement>) {
    setProfileMenuAnchor(event.currentTarget);
  }

  function handleProfileMenuClose() {
    setProfileMenuAnchor(null);
  }

  function handleOpenProfileDrawer() {
    setProfileDrawerOpen(true);
    handleProfileMenuClose();
  }

  function renderDashboardOverview() {
    return (
      <>
        <div className="cards-grid">
          {summaryCards.map((card) => (
            <article key={card.title} className="summary-card">
              <strong>{card.title}</strong>
              <h2>{card.value}</h2>
              <small>{card.subtitle}</small>
            </article>
          ))}
        </div>

        <div className="dashboard-grid dashboard-main-grid">
          <section className="panel calendar-panel">
            <div className="panel-header calendar-header">
              <div>
                <h3>Calendário</h3>
                <span>{formatMonthLabel(selectedMonth)}</span>
              </div>
              <div className="calendar-nav">
                <button type="button" className="icon-button" onClick={() => changeMonth('prev')}>
                  ◀
                </button>
                <button type="button" className="icon-button" onClick={() => changeMonth('next')}>
                  ▶
                </button>
              </div>
            </div>
            <div className="calendar-grid">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day) => (
                <span key={day} className="calendar-day label">{day}</span>
              ))}
              {(() => {
                const [year, month] = selectedMonth.split('-').map(Number);
                const firstWeekday = new Date(year, month - 1, 1).getDay();
                return [
                  ...Array(firstWeekday).fill(null).map((_, index) => (
                    <span key={`empty-${index}`} className="calendar-day calendar-day--empty" />
                  )),
                  ...calendarDays.map((day) => {
                    const formattedDate = `${selectedMonth}-${String(day.day).padStart(2, '0')}`;
                    const dayButton = (
                      <button
                        key={day.day}
                        type="button"
                        className={`calendar-day ${selectedDate === formattedDate ? 'active' : ''}`}
                        onClick={() => setSelectedDate(formattedDate)}
                      >
                        <span>{day.day}</span>
                        {day.hasEvents && <span className="event-badge">{day.eventCount}</span>}
                      </button>
                    );

                    if (!day.hasEvents) {
                      return dayButton;
                    }

                    return (
                      <Tooltip
                        key={day.day}
                        title={`${day.eventCount} compromisso(s) em ${String(day.day).padStart(2, '0')}/${selectedMonth.slice(5, 7)}/${selectedMonth.slice(0, 4)}`}
                        arrow
                        slots={{ transition: Zoom }}
                      >
                        {dayButton}
                      </Tooltip>
                    );
                  }),
                ];
              })()}
            </div>
          </section>

          <div className="right-side-grid">
            <section className="panel list-panel">
              <div className="panel-header">
                <h3>Últimos contratos gerados</h3>
                <button type="button" className="button button--text" onClick={() => handleViewAll('contracts')}>
                  {expandedSection === 'contracts' ? 'Recolher' : 'Ver todos'}
                </button>
              </div>
              <div className="table-list">
                {visibleContracts.length > 0 ? (
                  visibleContracts.map((contract) => (
                    <div key={contract.company} className="table-row">
                      <div>
                        <strong>{contract.company}</strong>
                        <small>{contract.service}</small>
                      </div>
                      <span>{contract.start}</span>
                    </div>
                  ))
                ) : (
                  <p className="panel-empty">Nenhum contrato encontrado para o filtro atual.</p>
                )}
              </div>
            </section>

            <section className="panel upcoming-panel">
              <div className="panel-header">
                <h3>Próximos vencimentos</h3>
                <button type="button" className="button button--text" onClick={() => handleViewAll('dueDates')}>
                  {expandedSection === 'dueDates' ? 'Recolher' : 'Ver todos'}
                </button>
              </div>
              <div className="upcoming-list">
                {visibleDueDates.length > 0 ? (
                  visibleDueDates.map((item) => (
                    <div key={item.client} className="upcoming-row">
                      <div>
                        <strong>{item.client}</strong>
                        <small>{item.reference}</small>
                      </div>
                      <div className="upcoming-meta">
                        <span>{item.due}</span>
                        <span className={`badge badge--${item.priority.toLowerCase()}`}>{item.priority}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="panel-empty">Nenhum vencimento encontrado para o filtro atual.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </>
    );
  }

  function renderAgendaView() {
    const agendaModes: Array<{ key: AgendaViewMode; label: string }> = [
      { key: 'semanal', label: 'Agenda semanal' },
      { key: 'mensal', label: 'Agenda mensal' },
    ];

    const renderAgendaMonthCalendar = () => (
      <section className="panel calendar-panel agenda-month-panel">
        <div className="panel-header calendar-header">
          <div>
            <h3>Agenda mensal</h3>
            <span>{formatMonthLabel(selectedMonth)}</span>
          </div>
          <div className="calendar-nav">
            <button type="button" className="icon-button" onClick={() => changeMonth('prev')}>
              ◀
            </button>
            <button type="button" className="icon-button" onClick={() => changeMonth('next')}>
              ▶
            </button>
          </div>
        </div>
        <div className="calendar-grid">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day) => (
            <span key={day} className="calendar-day label">{day}</span>
          ))}
          {(() => {
            const [year, month] = selectedMonth.split('-').map(Number);
            const firstWeekday = new Date(year, month - 1, 1).getDay();
            return [
              ...Array(firstWeekday).fill(null).map((_, index) => (
                <span key={`month-empty-${index}`} className="calendar-day calendar-day--empty" />
              )),
              ...calendarDays.map((day) => {
                const formattedDate = `${selectedMonth}-${String(day.day).padStart(2, '0')}`;
                return (
                  <button
                    key={`month-${day.day}`}
                    type="button"
                    className={`calendar-day ${selectedDate === formattedDate ? 'active' : ''}`}
                    onClick={() => setSelectedDate(formattedDate)}
                  >
                    <span>{day.day}</span>
                    {day.hasEvents && <span className="event-badge">{day.eventCount}</span>}
                  </button>
                );
              }),
            ];
          })()}
        </div>
      </section>
    );

    const renderAgendaCreatePanel = () => (
      <div className="panel agenda-create-sidepanel">
        <div className="panel-header">
          <div>
            <h3>Criar novo evento</h3>
            <span>{selectedDate}</span>
          </div>
          <button type="button" className="icon-button" onClick={() => setShowAgendaCreatePanel(false)}>
            ←
          </button>
        </div>
        <form className="agenda-form" onSubmit={handleCreateMeeting}>
          <label>
            Nome do Evento
            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Insira o nome do evento" required />
          </label>
          <label>
            Categoria
            <input type="text" value={formPresencial ? 'Presencial' : 'Online'} readOnly />
          </label>
          <div className="agenda-form-row">
            <label>
              Hora
              <input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} required />
            </label>
            <label className="agenda-checkbox">
              <input type="checkbox" checked={formPresencial} onChange={(e) => setFormPresencial(e.target.checked)} />
              Presencial
            </label>
          </div>
          {formPresencial ? (
            <label>
              Sala
              <input type="text" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} required />
            </label>
          ) : (
            <label>
              Link online
              <input type="url" value={formLinkOnline} onChange={(e) => setFormLinkOnline(e.target.value)} required />
            </label>
          )}
          {formError && <p className="form-error">{formError}</p>}
          <button type="submit" className="button button--primary" disabled={formSubmitting}>
            {formSubmitting ? 'Agendando...' : 'Salvar evento'}
          </button>
        </form>
      </div>
    );

    return (
      <section className="panel stacked-panel">
        <div className="section-topbar">
          <div>
            <h3>Agenda</h3>
            <span>Visões semanal, mensal e criação de compromissos</span>
          </div>
          <div className="section-actions">
            <div className="segmented-control">
              {agendaModes.map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  className={`segmented-control-button ${agendaViewMode === mode.key ? 'active' : ''}`}
                  onClick={() => setAgendaViewMode(mode.key)}
                >
                  {mode.label.replace('Agenda ', '')}
                </button>
              ))}
            </div>
            <button type="button" className="button button--primary section-create-button" onClick={() => setShowAgendaCreatePanel(true)}>
              + Novo evento
            </button>
          </div>
        </div>

        {showAgendaCreatePanel ? (
          <section className="agenda-create-layout">
            <div>
              {agendaViewMode === 'semanal' ? (
                <section className="agenda-week-board">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map((day, index) => {
                    const items = getAgendaWeekItems(index);

                    return (
                      <article key={day} className="agenda-week-column">
                        <header className="agenda-week-column-header">
                          <strong>{day}</strong>
                          <small>{items.length} item(ns)</small>
                        </header>
                        <div className="agenda-week-column-list">
                          {items.length > 0 ? (
                            items.map((item) => (
                              <article key={`${day}-${item.id}`} className="agenda-week-item-card">
                                <strong>{item.title}</strong>
                                <small>{item.company}</small>
                                <span>{item.time}</span>
                              </article>
                            ))
                          ) : (
                            <p className="panel-empty">Sem compromissos</p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </section>
              ) : (
                renderAgendaMonthCalendar()
              )}
            </div>
            {renderAgendaCreatePanel()}
          </section>
        ) : agendaViewMode === 'semanal' ? (
          <section className="agenda-week-board">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map((day, index) => {
              const items = getAgendaWeekItems(index);

              return (
                <article key={day} className="agenda-week-column">
                  <header className="agenda-week-column-header">
                    <strong>{day}</strong>
                    <small>{items.length} item(ns)</small>
                  </header>
                  <div className="agenda-week-column-list">
                    {items.length > 0 ? (
                      items.map((item) => (
                        <article key={`${day}-${item.id}`} className="agenda-week-item-card">
                          <strong>{item.title}</strong>
                          <small>{item.company}</small>
                          <span>{item.time}</span>
                        </article>
                      ))
                    ) : (
                      <p className="panel-empty">Sem compromissos</p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          renderAgendaMonthCalendar()
        )}
      </section>
    );
  }

  function renderCompanyView() {
    if (selectedCompany) {
      return (
        <section className="panel stacked-panel">
          <div className="section-topbar">
            <div>
              <h3>{selectedCompany.name}</h3>
              <span>{selectedCompany.document} · {selectedCompany.status}</span>
            </div>
            <div className="section-actions">
              <button type="button" className="button button--outline" onClick={() => setSelectedCompany(null)}>
                Voltar para empresas
              </button>
            </div>
          </div>

          <div className="detail-tabs">
            {companyDetailTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`detail-tab-button ${companyDetailTab === tab ? 'active' : ''}`}
                onClick={() => setCompanyDetailTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {companyDetailTab === 'Visão geral' && (
            <div className="company-detail-layout">
              <div className="company-detail-hero panel">
                <div className="company-card-header">
                  <div className="company-avatar">{selectedCompany.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                  <div className="company-detail-copy">
                    <strong>{selectedCompany.name}</strong>
                    <small>{selectedCompany.document}</small>
                  </div>
                </div>
                <div className="company-tags">
                  {selectedCompany.tags.map((tag) => (
                    <span key={tag} className={`proposal-chip proposal-chip--${tag.toLowerCase()}`}>{tag}</span>
                  ))}
                </div>
                <div className="company-status-row">
                  <span className={`company-status-dot company-status-dot--${selectedCompany.status.toLowerCase()}`} />
                  <small>{selectedCompany.status} <span>{selectedCompany.statusSince}</span></small>
                </div>
              </div>

              <div className="company-metrics-grid">
                {[
                  { label: 'Contratos ativos', value: `${companyContractsData.filter((item) => item.status.toUpperCase() === 'ATIVO').length}` },
                  { label: 'Propostas abertas', value: `${companyProposalsData.length}` },
                  { label: 'Documentos', value: `${companyDocumentsData.length}` },
                  { label: 'Reuniões', value: `${companyMeetingsData.length}` },
                ].map((item) => (
                  <article key={item.label} className="company-metric-card">
                    <small className="company-metric-label">{item.label}</small>
                    <strong className="company-metric-value">{item.value}</strong>
                  </article>
                ))}
              </div>
            </div>
          )}

          {companyDetailTab === 'Propostas' && (
            <div className="detail-table-list">
              {companyProposalsData.map((item) => (
                <article key={item.title} className="detail-table-row">
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.service}</small>
                  </div>
                  <span>{item.amount}</span>
                  <span className="detail-table-status">{item.status}</span>
                  <Tooltip title="Ver detalhes" arrow>
                    <button
                      type="button"
                      className="icon-button detail-icon-button"
                      aria-label="Ver detalhes da proposta"
                      onClick={() =>
                        openEntityActionPreview({
                          title: item.title,
                          subtitle: 'Detalhes da proposta comercial',
                          actionLabel: 'Fechar',
                          actionIcon: '⌕',
                          details: [
                            { label: 'Serviço', value: item.service },
                            { label: 'Valor', value: item.amount },
                            { label: 'Status', value: item.status },
                          ],
                        })
                      }
                    >
                      ⌕
                    </button>
                  </Tooltip>
                </article>
              ))}
            </div>
          )}

          {companyDetailTab === 'Contratos' && (
            <div className="detail-table-list">
              {companyContractsData.map((item) => (
                <article key={item.code} className="detail-table-row">
                  <div>
                    <strong>{item.code}</strong>
                    <small>{item.service}</small>
                  </div>
                  <span>{item.startDate}</span>
                  <span className="detail-table-status">{item.status}</span>
                  <Tooltip title="Abrir contrato" arrow>
                    <button
                      type="button"
                      className="icon-button detail-icon-button"
                      aria-label="Abrir contrato"
                      onClick={() =>
                        openEntityActionPreview({
                          title: item.code,
                          subtitle: 'Resumo do contrato',
                          actionLabel: 'Fechar',
                          actionIcon: '↗',
                          details: [
                            { label: 'Serviço', value: item.service },
                            { label: 'Início', value: item.startDate },
                            { label: 'Status', value: item.status },
                          ],
                        })
                      }
                    >
                      ↗
                    </button>
                  </Tooltip>
                </article>
              ))}
            </div>
          )}

          {companyDetailTab === 'Documentos' && (
            <div className="detail-table-list">
              {companyDocumentsData.map((item) => (
                <article key={item.name} className="detail-table-row">
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.category}</small>
                  </div>
                  <span className="detail-table-status">{item.status}</span>
                  <Tooltip title="Ver documento" arrow>
                    <button
                      type="button"
                      className="icon-button detail-icon-button"
                      aria-label="Ver documento"
                      onClick={() =>
                        openEntityActionPreview({
                          title: item.name,
                          subtitle: 'Documento da empresa',
                          actionLabel: 'Fechar',
                          actionIcon: '⌕',
                          details: [
                            { label: 'Categoria', value: item.category },
                            { label: 'Status', value: item.status },
                            { label: 'Empresa', value: selectedCompany?.name ?? 'Empresa atual' },
                          ],
                        })
                      }
                    >
                      ⌕
                    </button>
                  </Tooltip>
                </article>
              ))}
            </div>
          )}

          {companyDetailTab === 'Reuniões' && (
            <div className="detail-table-list">
              {companyMeetingsData.map((item) => (
                <article key={`${item.topic}-${item.date}`} className="detail-table-row">
                  <div>
                    <strong>{item.topic}</strong>
                    <small>{item.channel}</small>
                  </div>
                  <span>{item.date}</span>
                  <Tooltip title="Ver reunião" arrow>
                    <button
                      type="button"
                      className="icon-button detail-icon-button"
                      aria-label="Ver reunião"
                      onClick={() =>
                        openEntityActionPreview({
                          title: item.topic,
                          subtitle: 'Detalhes da reunião',
                          actionLabel: 'Fechar',
                          actionIcon: '⌕',
                          details: [
                            { label: 'Canal', value: item.channel },
                            { label: 'Data', value: item.date },
                            { label: 'Cliente', value: selectedCompany?.name ?? 'Empresa atual' },
                          ],
                        })
                      }
                    >
                      ⌕
                    </button>
                  </Tooltip>
                </article>
              ))}
            </div>
          )}

          {companyDetailTab === 'Relatórios' && (
            <div className="detail-table-list">
              {companyReports.map((item) => (
                <article key={item.title} className="detail-table-row">
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.period}</small>
                  </div>
                  <span className="detail-table-status">{item.status}</span>
                  <Tooltip title="Baixar relatório" arrow>
                    <button
                      type="button"
                      className="icon-button detail-icon-button"
                      aria-label="Baixar relatório"
                      onClick={() =>
                        openEntityActionPreview({
                          title: item.title,
                          subtitle: 'Relatório pronto para download',
                          actionLabel: 'Baixar agora',
                          actionIcon: '↓',
                          variant: 'download',
                          fileName: `${item.title.toLowerCase().replace(/\s+/g, '-')}.txt`,
                          fileContent: [`Relatório: ${item.title}`, `Período: ${item.period}`, `Status: ${item.status}`, `Empresa: ${selectedCompany?.name ?? 'Empresa atual'}`].join('\n'),
                          details: [
                            { label: 'Período', value: item.period },
                            { label: 'Status', value: item.status },
                            { label: 'Formato', value: 'TXT de demonstração' },
                          ],
                        })
                      }
                    >
                      ↓
                    </button>
                  </Tooltip>
                </article>
              ))}
            </div>
          )}
        </section>
      );
    }

    const renderCompanyCreatePanel = () => (
      <div className="panel agenda-create-sidepanel company-create-sidepanel">
        <div className="panel-header">
          <div>
            <h3>Criar nova empresa</h3>
            <span>Cadastre um novo cliente na base</span>
          </div>
          <button type="button" className="icon-button" onClick={closeCompanyCreatePanel}>
            ←
          </button>
        </div>
        <form className="agenda-form" onSubmit={handleCreateCompany}>
          <label>
            Nome da empresa
            <input
              type="text"
              value={companyFormName}
              onChange={(e) => setCompanyFormName(e.target.value)}
              placeholder="Insira o nome da empresa"
              required
            />
          </label>
          <label>
            Documento
            <input
              type="text"
              value={companyFormDocument}
              onChange={(e) => setCompanyFormDocument(e.target.value)}
              placeholder="00.000.000/0001-00"
              required
            />
          </label>
          <label>
            Categoria
            <input
              type="text"
              value={companyFormTags}
              onChange={(e) => setCompanyFormTags(e.target.value)}
              placeholder="BPO, Valuation, Financeiro"
              required
            />
          </label>
          <label>
            Status
            <input
              type="text"
              value={companyFormStatus}
              onChange={(e) => setCompanyFormStatus(e.target.value === 'Inativa' ? 'Inativa' : 'Ativa')}
              placeholder="Ativa"
            />
          </label>
          {companyFormError && <p className="form-error">{companyFormError}</p>}
          <button type="submit" className="button button--primary" disabled={companyFormSubmitting}>
            {companyFormSubmitting ? 'Salvando...' : 'Salvar empresa'}
          </button>
        </form>
      </div>
    );

    return (
      <section className="panel stacked-panel">
        <div className="section-topbar">
          <div>
            <h3>Empresas</h3>
            <span>{filteredCompanies.length} empresa(s) listada(s)</span>
          </div>
          <div className="section-actions">
            <label className="inline-search">
              <span>⌕</span>
              <input type="search" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
            <button type="button" className="button button--primary section-create-button" onClick={handleOpenCompanyCreatePanel}>
              ＋ Nova Empresa
            </button>
          </div>
        </div>

        {showCompanyCreatePanel ? (
          <section className="agenda-create-layout company-create-layout">
            <div className="company-grid">
              {filteredCompanies.map((company) => (
                <article key={company.name} className="company-card company-card--interactive">
                  <div className="company-card-header">
                    <div className="company-avatar">{company.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                    <div>
                      <strong>{company.name}</strong>
                      <small>{company.document}</small>
                    </div>
                  </div>

                  <div className="company-tags">
                    {company.tags.map((tag) => (
                      <span key={tag} className={`proposal-chip proposal-chip--${tag.toLowerCase()}`}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="company-status-row">
                    <span className={`company-status-dot company-status-dot--${company.status.toLowerCase()}`} />
                    <small>
                      {company.status} <span>{company.statusSince}</span>
                    </small>
                  </div>

                  <button type="button" className="button button--outline company-open-button" onClick={() => openCompanyDetails(company)}>
                    Abrir detalhes
                  </button>
                </article>
              ))}
            </div>
            {renderCompanyCreatePanel()}
          </section>
        ) : (
          <div className="company-grid">
            {filteredCompanies.map((company) => (
              <article key={company.name} className="company-card company-card--interactive">
                <div className="company-card-header">
                  <div className="company-avatar">{company.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                  <div>
                    <strong>{company.name}</strong>
                    <small>{company.document}</small>
                  </div>
                </div>

                <div className="company-tags">
                  {company.tags.map((tag) => (
                    <span key={tag} className={`proposal-chip proposal-chip--${tag.toLowerCase()}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="company-status-row">
                  <span className={`company-status-dot company-status-dot--${company.status.toLowerCase()}`} />
                  <small>
                    {company.status} <span>{company.statusSince}</span>
                  </small>
                </div>

                <button type="button" className="button button--outline company-open-button" onClick={() => openCompanyDetails(company)}>
                  Abrir detalhes
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  function renderTeamView() {
    const onlineCount = filteredTeamMembers.filter((member) => member.status === 'Online').length;
    const meetingCount = filteredTeamMembers.filter((member) => member.status === 'Em reunião').length;
    const offlineCount = filteredTeamMembers.filter((member) => member.status === 'Offline').length;

    const teamHighlights = [
      { label: 'Membros ativos', value: `${filteredTeamMembers.length}`, note: 'visíveis no filtro atual' },
      { label: 'Online', value: `${onlineCount}`, note: 'disponíveis agora' },
      { label: 'Em reunião', value: `${meetingCount}`, note: 'em atendimento' },
      { label: 'Offline', value: `${offlineCount}`, note: 'fora do expediente' },
    ];

    return (
      <section className="panel stacked-panel">
        <div className="section-topbar">
          <div>
            <h3>Equipe</h3>
            <span>Pessoas, disponibilidade e atuação da operação</span>
          </div>
          <div className="section-actions">
            <label className="inline-search">
              <span>⌕</span>
              <input type="search" placeholder="Pesquisar integrante..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
            <button type="button" className="button button--primary section-create-button" onClick={handleOpenTeamCreateModal}>
              ＋ Novo membro
            </button>
          </div>
        </div>

        <div className="team-highlights-grid">
          {teamHighlights.map((item) => (
            <article key={item.label} className="team-highlight-card">
              <small>{item.label}</small>
              <strong>{item.value}</strong>
              <span>{item.note}</span>
            </article>
          ))}
        </div>

        <div className="team-grid">
          {filteredTeamMembers.map((member) => (
            <article key={member.name} className="team-member-card" onClick={() => setSelectedTeamMember(member)}>
              <div className="team-member-header">
                <div className="team-member-identity">
                  <div className="team-member-avatar">
                    {member.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="team-member-copy">
                    <strong>{member.name}</strong>
                    <small>{member.role}</small>
                  </div>
                </div>
                <span className={`entity-chip entity-chip--${member.status.toLowerCase().replace(/\s+/g, '-')}`}>{member.status}</span>
              </div>

              <div className="team-member-meta">
                <div className="team-member-meta-item">
                  <span>Status atual</span>
                  <strong>
                    {member.status === 'Online'
                      ? 'Disponível'
                      : member.status === 'Em reunião'
                        ? 'Ocupado'
                        : 'Indisponível'}
                  </strong>
                </div>
                <div className="team-member-meta-item">
                  <span>Área</span>
                  <strong>{member.role}</strong>
                </div>
                <div className="team-member-meta-item">
                  <span>E-mail</span>
                  <strong>{member.email}</strong>
                </div>
                <div className="team-member-meta-item">
                  <span>Contato</span>
                  <strong>{member.phone}</strong>
                </div>
              </div>

              <div className="team-member-footer">
                <span className="team-member-dot" />
                <small>
                  {member.status === 'Online'
                    ? 'Última atualização há poucos minutos'
                    : member.status === 'Em reunião'
                      ? 'Em compromisso no momento'
                      : 'Sem atividade recente'}
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderProposalView() {
    return (
      <section className="panel stacked-panel">
        <div className="section-topbar">
          <div>
            <h3>Propostas comerciais</h3>
            <span>Acompanhamento rápido das oportunidades</span>
          </div>
          <div className="section-actions">
            <label className="inline-search">
              <span>⌕</span>
              <input type="search" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
          </div>
        </div>

        <div className="proposal-board">
          {filteredProposalColumns.map((column) => (
            <section key={column.title} className="proposal-column">
              <div className="proposal-column-header">{column.title}</div>
              <div className="proposal-column-list">
                {column.items.map((item, index) => (
                  <article key={`${column.title}-${item.company}-${index}`} className="proposal-card">
                    <div className="proposal-card-top">
                      <strong>{item.company}</strong>
                      <small>{item.amount}</small>
                    </div>
                    <div className="proposal-card-middle">
                      <span className={`proposal-chip proposal-chip--${item.tag.toLowerCase()}`}>{item.tag}</span>
                    </div>
                    <div className="proposal-card-bottom">
                      <span className="proposal-card-avatar">M</span>
                      <small>{item.createdLabel}</small>
                    </div>
                    <Tooltip title="Ver detalhes" arrow>
                      <button
                        type="button"
                        className="icon-button detail-icon-button"
                        onClick={() => handleOpenProposalDetail(item, column.title)}
                        aria-label="Ver detalhes da proposta"
                      >
                        ⌕
                      </button>
                    </Tooltip>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    );
  }

  function renderProfileView() {
    const statusClass = profile.status.toLowerCase().replace(/\s+/g, '-');

    return (
      <section className="panel stacked-panel profile-panel">
        <div className="panel-header">
          <div>
            <h3>Perfil</h3>
            <span>Dados da conta e preferências principais</span>
          </div>
          <button type="button" className="button button--outline" onClick={() => setProfileDrawerOpen(true)}>
            Editar perfil
          </button>
        </div>

        <div className="profile-overview-layout">
          <article className="profile-summary-card">
            <div className="profile-summary-main">
              <Avatar sx={{ width: 56, height: 56, bgcolor: '#42bee8', color: '#04121f', fontWeight: 700 }}>{userInitials}</Avatar>
              <div className="profile-summary-text">
                <div className="profile-summary-heading">
                  <strong>{profile.fullName}</strong>
                  <small>{profile.role}</small>
                </div>
                <span className={`entity-chip entity-chip--${statusClass}`}>{profile.status}</span>
              </div>
            </div>
          </article>

          <article className="profile-info-card">
            <strong>E-mail</strong>
            <small>{profile.email}</small>
          </article>

          <article className="profile-info-card">
            <strong>Telefone</strong>
            <small>{profile.phone}</small>
          </article>

          <article className="profile-strip-card">
            <span className="profile-strip-label">{profile.documentType}</span>
            <span className="profile-strip-value">{profile.documentNumber}</span>
          </article>

          <article className="profile-strip-card">
            <span className="profile-strip-label">Empresa</span>
            <span className="profile-strip-value">{profile.company}</span>
          </article>
        </div>
      </section>
    );
  }

  function renderSettingsView() {
    const settingsTabs: SettingsSection[] = ['Meu Perfil', 'Segurança', 'Notificações', 'Integrações'];

    return (
      <section className="panel stacked-panel">
        <div className="section-topbar">
          <div>
            <h3>Configurações</h3>
            <span>Conta, preferências e controle operacional</span>
          </div>
        </div>

        <div className="detail-tabs">
          {settingsTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`detail-tab-button ${settingsSection === tab ? 'active' : ''}`}
              onClick={() => setSettingsSection(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {settingsSection === 'Meu Perfil' && (
          <form className="settings-grid settings-form" onSubmit={handleSaveProfileSettings}>
            <label className="settings-item settings-item--stacked">
              <span>Nome completo</span>
              <input type="text" value={settingsName} onChange={(e) => setSettingsName(e.target.value)} />
            </label>
            <label className="settings-item settings-item--stacked">
              <span>Telefone</span>
              <input type="text" value={settingsPhone} onChange={(e) => setSettingsPhone(e.target.value)} />
            </label>
            <label className="settings-item settings-item--stacked settings-item--full">
              <span>E-mail principal</span>
              <input type="email" value={settingsEmail} onChange={(e) => setSettingsEmail(e.target.value)} />
            </label>
            <div className="settings-actions settings-item--full">
              <button type="button" className="button button--outline" onClick={() => setSettingsSection('Segurança')}>
                Alterar senha
              </button>
              <button type="submit" className="button button--primary">
                Salvar alterações
              </button>
            </div>
          </form>
        )}

        {settingsSection === 'Segurança' && (
          <form className="settings-grid settings-form" onSubmit={handleChangePassword}>
            <label className="settings-item settings-item--stacked settings-item--full">
              <span>Senha atual</span>
              <input type="password" value={securityCurrentPassword} onChange={(e) => setSecurityCurrentPassword(e.target.value)} />
            </label>
            <label className="settings-item settings-item--stacked">
              <span>Nova senha</span>
              <input type="password" value={securityNewPassword} onChange={(e) => setSecurityNewPassword(e.target.value)} />
            </label>
            <label className="settings-item settings-item--stacked">
              <span>Confirmar senha</span>
              <input type="password" value={securityConfirmPassword} onChange={(e) => setSecurityConfirmPassword(e.target.value)} />
            </label>
            <div className="settings-actions settings-item--full">
              <button type="button" className="button button--outline" onClick={() => setShowLogoutConfirm(true)}>
                Sair da conta
              </button>
              <button type="submit" className="button button--primary">
                Atualizar senha
              </button>
            </div>
          </form>
        )}

        {settingsSection === 'Notificações' && (
          <div className="settings-grid">
            <label className="settings-item">
              <span>Notificações no sistema</span>
              <input type="checkbox" checked={notificationsSystem} onChange={() => setNotificationsSystem((v) => !v)} />
            </label>
            <label className="settings-item">
              <span>Notificações no e-mail</span>
              <input type="checkbox" checked={notificationsEmail} onChange={() => setNotificationsEmail((v) => !v)} />
            </label>
            <label className="settings-item">
              <span>Alertas de prazo</span>
              <input type="checkbox" checked={notificationsAlerts} onChange={() => setNotificationsAlerts((v) => !v)} />
            </label>
          </div>
        )}

        {settingsSection === 'Integrações' && (
          <div className="settings-grid">
            <article className="settings-item">
              <span>Google Drive</span>
              <button
                type="button"
                className="button button--outline"
                disabled={integrationsLoading}
                onClick={() => toggleIntegration('googleDrive')}
              >
                {integrations.googleDrive ? 'Conectado' : 'Conectar'}
              </button>
            </article>
            <article className="settings-item">
              <span>Google Calendar</span>
              <button
                type="button"
                className="button button--outline"
                disabled={integrationsLoading}
                onClick={() => toggleIntegration('googleCalendar')}
              >
                {integrations.googleCalendar ? 'Conectado' : 'Conectar'}
              </button>
            </article>
            <article className="settings-item">
              <span>Google Sheets</span>
              <button
                type="button"
                className="button button--outline"
                disabled={integrationsLoading}
                onClick={() => toggleIntegration('googleSheets')}
              >
                {integrations.googleSheets ? 'Conectado' : 'Conectar'}
              </button>
            </article>
            <article className="settings-item">
              <span>Gmail</span>
              <button
                type="button"
                className="button button--outline"
                disabled={integrationsLoading}
                onClick={() => toggleIntegration('gmail')}
              >
                {integrations.gmail ? 'Conectado' : 'Conectar'}
              </button>
            </article>
          </div>
        )}
      </section>
    );
  }

  function renderActiveContent() {
    switch (activeMenuItem) {
      case 'Agenda':
        return renderAgendaView();
      case 'Propostas comerciais':
        return renderProposalView();
      case 'Clientes / Empresas':
        return renderCompanyView();
      case 'Equipe':
        return renderTeamView();
      case 'Configurações':
        return renderSettingsView();
      case 'Perfil':
        return renderProfileView();
      default:
        return renderDashboardOverview();
    }
  }

  return (
    <main
      className={`screen dashboard-screen ${isMobileSidebarOpen ? 'dashboard-screen--sidebar-open' : ''} ${isLightSurfaceMode ? 'dashboard-screen--light' : ''}`}
    >
      <button
        type="button"
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'sidebar-overlay--visible' : ''}`}
        aria-label="Fechar menu lateral"
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <aside className={`sidebar ${isMobileSidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-tag">climbe</span>
        </div>

        <div className="sidebar-search">
          <input
            type="search"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Menu Principal</div>
          <nav className="sidebar-nav">
            {primaryMenuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`sidebar-link ${item.label === activeMenuItem ? 'active' : ''}`}
                onClick={() => handleMenuClick(item)}
              >
                <span className="sidebar-link-indicator" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Gestão</div>
          <nav className="sidebar-nav">
            {secondaryMenuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`sidebar-link ${item.label === activeMenuItem ? 'active' : ''}`}
                onClick={() => handleMenuClick(item)}
              >
                <span className="sidebar-link-indicator" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-section-title">Conta</div>
          <nav className="sidebar-nav">
            {accountItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`sidebar-link ${item.isLogout ? 'sidebar-link--secondary' : ''}`}
                onClick={() => handleAccountNavigation(item.isLogout ? 'Sair' : 'Configurações')}
              >
                <span className="sidebar-link-indicator" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-toolbar">
          <div className="toolbar-left">
            <button
              type="button"
              className="icon-button mobile-nav-button"
              aria-label={isMobileSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setIsMobileSidebarOpen((current) => !current)}
            >
              ☰
            </button>
            <div className="toolbar-labels">
              <span className="page-label">{activeMenuItem.toUpperCase()}</span>
              <small>Visão geral</small>
            </div>
          </div>
          <div className="toolbar-actions">
            <button
              type="button"
              className={`button theme-toggle-button ${isLightSurfaceMode ? 'theme-toggle-button--light' : 'theme-toggle-button--dark'}`}
              onClick={() => setIsLightSurfaceMode((current) => !current)}
            >
              {isLightSurfaceMode ? 'Modo escuro' : 'Modo claro'}
            </button>
            <button type="button" className="icon-button notification-trigger" aria-label="Notificações" onClick={handleNotificationsOpen}>
              🔔
              <span className="notification-trigger-dot" />
            </button>
            <button type="button" className="icon-button" aria-label="Ajustes" onClick={() => handleToolbarAction('settings')}>⚙️</button>
            <button type="button" className="user-chip user-chip-button" onClick={handleProfileMenuOpen}>
              <span>{userInitials}</span>
              <div>
                <strong>{profile.fullName}</strong>
                <small>{profile.role}</small>
              </div>
              <span className="user-chip-chevron">▾</span>
            </button>
          </div>
        </div>

        <header className="dashboard-header">
          <div>
            <p>Bem vindo(a) de volta, {firstName}</p>
            <h1>{activeMenuItem} / Visão geral</h1>
          </div>
          <div className="dashboard-actions">
            <button className="button button--outline" onClick={handleViewReport}>Ver relatório</button>
          </div>
        </header>
        <section className="dashboard-highlights" aria-label="Indicadores rápidos">
          {toolbarHighlights.map((item) => (
            <article key={item.label} className="dashboard-highlight-card">
              <small>{item.label}</small>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        {renderActiveContent()}

        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1.25,
                width: 360,
                maxWidth: 'calc(100vw - 24px)',
                background: '#0b1220',
                color: '#edf2f7',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(0,0,0,0.34)',
              },
            },
          }}
        >
          <div className="notification-menu-header">
            <div>
              <strong>Notificações</strong>
              <small>Painel rápido da operação</small>
            </div>
            <button type="button" className="button button--text notification-menu-close" onClick={handleNotificationsClose}>
              Fechar
            </button>
          </div>
          <div className="notification-menu-list">
            {notificationItems.map((item) => (
              <article key={`${item.title}-${item.description}`} className={`notification-menu-item notification-menu-item--${item.tone}`}>
                <span className="notification-menu-pulse" />
                <div className="notification-menu-copy">
                  <div className="notification-menu-meta">
                    <span className={`notification-channel notification-channel--${item.channel}`}>
                      {item.channel === 'site' ? 'Site' : item.channel === 'email' ? 'E-mail' : 'Agenda'}
                    </span>
                    <small>{item.timeLabel}</small>
                  </div>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </div>
              </article>
            ))}
          </div>
          <div className="notification-menu-footer">
            <button
              type="button"
              className="button button--outline"
              onClick={() => {
                setSettingsSection('Notificações');
                dispatch(setActiveMenuItem('Configurações'));
                handleNotificationsClose();
              }}
            >
              Ajustar notificações
            </button>
          </div>
        </Menu>

        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 240,
                background: '#0b1220',
                color: '#edf2f7',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 3,
              },
            },
          }}
        >
          <MuiMenuItem disabled>
            <div className="profile-menu-header">
              <strong>{profile.fullName}</strong>
              <small>{profile.email}</small>
            </div>
          </MuiMenuItem>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <MuiMenuItem onClick={handleOpenProfileDrawer}>
            <ListItemIcon>
              <Avatar sx={{ width: 24, height: 24, bgcolor: '#4cc9f0', color: '#04121f', fontSize: 12 }}>{userInitials}</Avatar>
            </ListItemIcon>
            Perfil
          </MuiMenuItem>
          <MuiMenuItem
            onClick={() => {
              dispatch(setActiveMenuItem('Configurações'));
              handleProfileMenuClose();
            }}
          >
            <ListItemIcon>
              <span className="profile-menu-icon">⚙️</span>
            </ListItemIcon>
            Configurações
          </MuiMenuItem>
          <MuiMenuItem
            onClick={() => {
              setShowLogoutConfirm(true);
              handleProfileMenuClose();
            }}
          >
            <ListItemIcon>
              <span className="profile-menu-icon">↪</span>
            </ListItemIcon>
            Sair
          </MuiMenuItem>
        </Menu>

        <ProfileDrawer open={profileDrawerOpen} onClose={() => setProfileDrawerOpen(false)} />

        {selectedTeamMember && (
          <div className="dialog-backdrop" onClick={() => setSelectedTeamMember(null)}>
            <section className="dialog-card" onClick={(event) => event.stopPropagation()}>
              <div className="panel-header">
                <div>
                  <h3>{selectedTeamMember.name}</h3>
                  <span>{selectedTeamMember.role}</span>
                </div>
                <button type="button" className="icon-button" onClick={() => setSelectedTeamMember(null)}>✕</button>
              </div>
              <div className="team-detail-grid">
                <article className="team-member-meta-item">
                  <span>CPF</span>
                  <strong>{selectedTeamMember.cpf}</strong>
                </article>
                <article className="team-member-meta-item">
                  <span>E-mail</span>
                  <strong>{selectedTeamMember.email}</strong>
                </article>
                <article className="team-member-meta-item">
                  <span>Contato</span>
                  <strong>{selectedTeamMember.phone}</strong>
                </article>
                <article className="team-member-meta-item">
                  <span>Status</span>
                  <strong>{selectedTeamMember.status}</strong>
                </article>
                {teamFocuses.map((item) => (
                  <article key={item.title} className="team-member-meta-item">
                    <span>{item.title}</span>
                    <strong>{item.detail}</strong>
                  </article>
                ))}
                <article className="team-member-meta-item team-member-meta-item--full">
                  <span>Permissões</span>
                  <div className="team-permissions-grid">
                    {selectedTeamMember.permissions.map((permission) => (
                      <span key={permission} className="team-permission-chip">{permission}</span>
                    ))}
                  </div>
                </article>
              </div>
            </section>
          </div>
        )}

        {showTeamCreateModal && (
          <div className="dialog-backdrop" onClick={handleCloseTeamCreateModal}>
            <section className="dialog-card" onClick={(event) => event.stopPropagation()}>
              <div className="panel-header">
                <div>
                  <h3>Novo Colaborador</h3>
                  <span>Cadastre um novo integrante da equipe</span>
                </div>
                <button type="button" className="icon-button" onClick={handleCloseTeamCreateModal}>✕</button>
              </div>

              <form className="team-create-form" onSubmit={handleCreateTeamMember}>
                <div className="team-create-grid">
                  <label>
                    Nome Completo
                    <input type="text" value={teamFormName} onChange={(e) => setTeamFormName(e.target.value)} required />
                  </label>
                  <label>
                    CPF
                    <input type="text" value={teamFormCpf} onChange={(e) => setTeamFormCpf(e.target.value)} required />
                  </label>
                  <label>
                    E-mail
                    <input type="email" value={teamFormEmail} onChange={(e) => setTeamFormEmail(e.target.value)} required />
                  </label>
                  <label>
                    Contato
                    <input type="text" value={teamFormPhone} onChange={(e) => setTeamFormPhone(e.target.value)} required />
                  </label>
                  <label>
                    Cargo
                    <select value={teamFormRole} onChange={(e) => setTeamFormRole(e.target.value)} required>
                      {teamRoleOptions.map((option) => (
                        <option key={option.value} value={option.label}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Situação
                    <select value={teamFormStatus} onChange={(e) => setTeamFormStatus(e.target.value === 'Offline' ? 'Offline' : 'Online')}>
                      <option value="Online">Ativo</option>
                      <option value="Offline">Inativo</option>
                    </select>
                  </label>
                </div>

                <div className="team-create-permissions">
                  <span>Permissões</span>
                  <div className="team-permissions-grid">
                    {teamPermissionOptions.map((permission) => (
                      <button
                        key={permission}
                        type="button"
                        className={`team-permission-chip ${teamFormPermissions.includes(permission) ? 'active' : ''}`}
                        onClick={() => toggleTeamPermission(permission)}
                      >
                        {permission}
                      </button>
                    ))}
                  </div>
                </div>

                {teamFormError && <p className="form-error">{teamFormError}</p>}

                <div className="dialog-actions">
                  <button type="button" className="button button--outline" onClick={handleCloseTeamCreateModal}>Cancelar</button>
                  <button type="submit" className="button button--primary">Salvar colaborador</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {selectedProposalDetail && (
          <div className="dialog-backdrop" onClick={() => setSelectedProposalDetail(null)}>
            <section className="dialog-card" onClick={(event) => event.stopPropagation()}>
              <div className="panel-header">
                <div>
                  <h3>{selectedProposalDetail.company}</h3>
                  <span>Etapa: {selectedProposalDetail.stage}</span>
                </div>
                <button type="button" className="icon-button" onClick={() => setSelectedProposalDetail(null)}>✕</button>
              </div>

              <div className="team-detail-grid">
                <article className="team-member-meta-item">
                  <span>Serviço</span>
                  <strong>{selectedProposalDetail.tag}</strong>
                </article>
                <article className="team-member-meta-item">
                  <span>Valor</span>
                  <strong>{selectedProposalDetail.amount}</strong>
                </article>
                <article className="team-member-meta-item team-member-meta-item--full">
                  <span>Histórico</span>
                  <strong>{selectedProposalDetail.createdLabel}</strong>
                </article>
              </div>

              <div className="dialog-actions">
                <button type="button" className="button button--outline" onClick={() => setSelectedProposalDetail(null)}>Fechar</button>
              </div>
            </section>
          </div>
        )}

        {entityActionModal && (
          <div className="dialog-backdrop" onClick={closeEntityActionPreview}>
            <section className="dialog-card dialog-card--compact" onClick={(event) => event.stopPropagation()}>
              <div className="panel-header">
                <div>
                  <h3>{entityActionModal.title}</h3>
                  <span>{entityActionModal.subtitle}</span>
                </div>
                <button type="button" className="icon-button" onClick={closeEntityActionPreview}>✕</button>
              </div>

              <div className="team-detail-grid">
                {entityActionModal.details.map((detail) => (
                  <article key={detail.label} className="team-member-meta-item">
                    <span>{detail.label}</span>
                    <strong>{detail.value}</strong>
                  </article>
                ))}
              </div>

              <div className="dialog-actions">
                <button type="button" className="button button--outline" onClick={closeEntityActionPreview}>Cancelar</button>
                <button type="button" className="button button--primary" onClick={confirmEntityActionPreview}>
                  {entityActionModal.actionIcon} {entityActionModal.actionLabel}
                </button>
              </div>
            </section>
          </div>
        )}

        {showLogoutConfirm && (
          <div className="dialog-backdrop" onClick={cancelLogout}>
            <section className="dialog-card dialog-card--compact" onClick={(event) => event.stopPropagation()}>
              <div className="panel-header">
                <div>
                  <h3>Sair da conta</h3>
                  <span>Deseja encerrar a sessão atual?</span>
                </div>
              </div>
              <div className="dialog-actions">
                <button type="button" className="button button--outline" onClick={cancelLogout}>Cancelar</button>
                <button type="button" className="button button--primary" onClick={confirmLogout}>Confirmar saída</button>
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}