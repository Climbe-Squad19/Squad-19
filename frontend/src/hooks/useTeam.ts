import { useCallback, useEffect, useState } from 'react';
import { aprovarUsuario, createUsuario, fetchUsuarios, fetchUsuariosPendentes, type UsuarioApiResponse } from '../services/usuarios';
import { useAppDispatch } from '../store/hooks';
import { openNotifications } from '../store/uiSlice';
import { teamMembers } from '../mocks/team.mock';
import type { TeamMember } from '../types';
import { formatCargoDisplay, normalizeCargoFromApi } from '../utils/cargo';

type UseTeamParams = {
  canManagePendingRegistrations?: boolean;
  activeOnTeamPage?: boolean;
};

export function useTeam({ canManagePendingRegistrations = false, activeOnTeamPage = false }: UseTeamParams = {}) {
  const dispatch = useAppDispatch();
  const [members, setMembers] = useState<TeamMember[]>(teamMembers);
  const [cadastrosPendentes, setCadastrosPendentes] = useState<UsuarioApiResponse[]>([]);
  const [cadastrosPendentesLoading, setCadastrosPendentesLoading] = useState(false);
  const [aprovarCadastroId, setAprovarCadastroId] = useState<number | null>(null);
  const [cadastroApproveFeedback, setCadastroApproveFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const mapUsuarioToTeamMember = useCallback((usuario: UsuarioApiResponse): TeamMember => {
    const cargoKey = normalizeCargoFromApi(usuario.cargo);
    return {
      id: usuario.id,
      name: usuario.nomeCompleto,
      role: formatCargoDisplay(cargoKey),
      status: usuario.ativo ? 'Online' : 'Offline',
      email: usuario.email || 'sem-email@empresa.com',
      phone: usuario.telefone || '(00) 00000-0000',
      cpf: usuario.cpf || '000.000.000-00',
      permissions:
        usuario.permissoes && usuario.permissoes.length > 0
          ? usuario.permissoes.map((p) => formatCargoDisplay(normalizeCargoFromApi(p)))
          : [`Cargo: ${formatCargoDisplay(cargoKey)}`],
    };
  }, []);

  const refreshCadastrosPendentes = useCallback(async () => {
    setCadastrosPendentesLoading(true);
    try {
      const list = await fetchUsuariosPendentes();
      setCadastrosPendentes(list === null ? [] : list);
    } catch {
      setCadastrosPendentes([]);
    } finally {
      setCadastrosPendentesLoading(false);
    }
  }, []);

  const handleAprovarCadastroUsuario = useCallback(
    async (id: number) => {
      setCadastroApproveFeedback(null);
      setAprovarCadastroId(id);
      try {
        await aprovarUsuario(id);
        setCadastrosPendentes((prev) => prev.filter((u) => u.id !== id));
        await refreshCadastrosPendentes();
        const okMsg = 'Cadastro aprovado. O usuário já pode entrar.';
        dispatch(openNotifications(okMsg));
        setCadastroApproveFeedback({ tone: 'success', message: okMsg });
        try {
          const usuarios = await fetchUsuarios();
          setMembers(usuarios.map(mapUsuarioToTeamMember));
        } catch (teamErr) {
          console.error('Lista da equipe não atualizou após aprovar', teamErr);
          setCadastroApproveFeedback({
            tone: 'success',
            message: `${okMsg} (Recarregue a página se a equipe não atualizar.)`,
          });
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Não foi possível aprovar.';
        dispatch(openNotifications(msg));
        setCadastroApproveFeedback({ tone: 'error', message: msg });
      } finally {
        setAprovarCadastroId(null);
      }
    },
    [dispatch, mapUsuarioToTeamMember, refreshCadastrosPendentes]
  );

  useEffect(() => {
    async function loadUsers() {
      try {
        const usuarios = await fetchUsuarios();
        setMembers(usuarios.map(mapUsuarioToTeamMember));
      } catch (error) {
        console.error('Erro ao carregar equipe', error);
      }
    }

    void loadUsers();
  }, [mapUsuarioToTeamMember]);

  useEffect(() => {
    if (!canManagePendingRegistrations) {
      setCadastrosPendentes([]);
      return;
    }
    if (!activeOnTeamPage) {
      return;
    }
    void refreshCadastrosPendentes();
  }, [activeOnTeamPage, canManagePendingRegistrations, refreshCadastrosPendentes]);

  return {
    members,
    setMembers,
    cadastrosPendentes,
    cadastrosPendentesLoading,
    aprovarCadastroId,
    cadastroApproveFeedback,
    refreshCadastrosPendentes,
    handleAprovarCadastroUsuario,
    mapUsuarioToTeamMember,
  };
}
