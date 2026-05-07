import { useCallback, useEffect, useState } from 'react';
import { fetchContratos, fetchDocumentosByEmpresa, fetchPropostas, fetchReunioes } from '../services/business';
import { fetchEmpresas, type EmpresaApiResponse } from '../services/empresas';
import {
  companyContracts,
  companyDocuments,
  companyMeetings,
  companyProposals,
} from '../mocks/business.mock';
import { clientCompanies } from '../mocks/team.mock';
import type {
  ClientCompany,
  CompanyContract,
  CompanyDetailTab,
  CompanyDocument,
  CompanyMeeting,
  CompanyProposal,
} from '../types';

export function useCompanies() {
  const [companies, setCompanies] = useState<ClientCompany[]>(clientCompanies);
  const [selectedCompany, setSelectedCompany] = useState<ClientCompany | null>(null);
  const [companyDetailTab, setCompanyDetailTab] = useState<CompanyDetailTab>('Visão geral');
  const [companyProposalsData, setCompanyProposalsData] = useState<CompanyProposal[]>(companyProposals);
  const [companyContractsData, setCompanyContractsData] = useState<CompanyContract[]>(companyContracts);
  const [companyDocumentsData, setCompanyDocumentsData] = useState<CompanyDocument[]>(companyDocuments);
  const [companyMeetingsData, setCompanyMeetingsData] = useState<CompanyMeeting[]>(companyMeetings);

  const mapEmpresaToCard = useCallback((empresa: EmpresaApiResponse): ClientCompany => ({
    id: empresa.id,
    name: empresa.razaoSocial,
    document: empresa.cnpj || 'Nao informado',
    status: empresa.ativa ? 'Ativa' : 'Inativa',
    statusSince: empresa.dataCadastro
      ? `desde ${new Date(empresa.dataCadastro).toLocaleDateString('pt-BR')}`
      : 'sem data',
    tags: ['BPO'],
  }), []);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const empresas = await fetchEmpresas();
        setCompanies(empresas.map(mapEmpresaToCard));
      } catch (error) {
        console.error('Erro ao carregar empresas', error);
      }
    }

    void loadCompanies();
  }, [mapEmpresaToCard]);

  useEffect(() => {
    async function loadBusinessData() {
      try {
        const [propostas, contratos, reunioes] = await Promise.all([
          fetchPropostas(),
          fetchContratos(),
          fetchReunioes(),
        ]);

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
                channel: item.presencial ? item.sala || 'Presencial' : item.linkOnline || 'Online',
              }))
          );
        }
      } catch (error) {
        console.error('Erro ao carregar dados comerciais', error);
      }
    }

    void loadBusinessData();
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

    void loadCompanyDocuments();
  }, [selectedCompany]);

  return {
    companies,
    setCompanies,
    selectedCompany,
    setSelectedCompany,
    companyDetailTab,
    setCompanyDetailTab,
    companyProposalsData,
    companyContractsData,
    companyDocumentsData,
    companyMeetingsData,
    mapEmpresaToCard,
  };
}
