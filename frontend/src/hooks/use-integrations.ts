import { useEffect, useState } from 'react';
import { fetchGoogleOAuthDisponivel } from '../services/auth';
import {
  fetchMinhasIntegracoes,
  getGoogleIntegrationAuthUrl,
  updateIntegracao,
  type IntegracaoKey,
  type IntegracoesResponse,
} from '../services/integracoes';
import { useAppDispatch } from '../store/hooks';
import { openNotifications } from '../store/uiSlice';

const defaultIntegrations: IntegracoesResponse = {
  googleDrive: true,
  googleCalendar: true,
  googleSheets: true,
  gmail: true,
};

export function useIntegrations() {
  const dispatch = useAppDispatch();
  const [integrations, setIntegrations] = useState<IntegracoesResponse>(defaultIntegrations);
  const [integrationsLoading, setIntegrationsLoading] = useState(false);
  const [googleOAuthDisponivel, setGoogleOAuthDisponivel] = useState<boolean | null>(null);

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

    void loadIntegrations();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchGoogleOAuthDisponivel().then((ok) => {
      if (!cancelled) {
        setGoogleOAuthDisponivel(ok);
      }
    });
    return () => {
      cancelled = true;
    };
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

  async function toggleIntegration(name: IntegracaoKey) {
    const nextValue = !integrations[name];
    if (nextValue) {
      try {
        const authUrl = await getGoogleIntegrationAuthUrl(name);
        window.location.href = authUrl;
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao iniciar autenticação Google.';
        dispatch(openNotifications(message));
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
    }
  }

  return {
    integrations,
    integrationsLoading,
    googleOAuthDisponivel,
    toggleIntegration,
  };
}