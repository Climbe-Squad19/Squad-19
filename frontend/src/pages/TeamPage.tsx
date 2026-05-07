import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import TeamCreateModal from '../components/modals/TeamCreateModal';
import TeamMemberModal from '../components/modals/TeamMemberModal';
import { useTeam } from '../hooks/useTeam';
import { fetchUsuarios } from '../services/usuarios';
import { useAppSelector } from '../store/hooks';
import type { TeamMember } from '../types';

export default function TeamPage() {
  const { search } = useOutletContext<{ search: string }>();
  const profile = useAppSelector((state) => state.profile);
  const {
    members,
    setMembers,
    cadastrosPendentes,
    cadastrosPendentesLoading,
    aprovarCadastroId,
    cadastroApproveFeedback,
    handleAprovarCadastroUsuario,
    mapUsuarioToTeamMember,
  } = useTeam({
    canManagePendingRegistrations: profile.podeGerenciarCadastros,
    activeOnTeamPage: true,
  });
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [showTeamCreateModal, setShowTeamCreateModal] = useState(false);

  const searchTerm = search.trim().toLowerCase();
  const filteredTeamMembers = useMemo(
    () =>
      members.filter((member) =>
        !searchTerm || `${member.name} ${member.role} ${member.status}`.toLowerCase().includes(searchTerm)
      ),
    [members, searchTerm]
  );

  async function handleCreated() {
    const usuarios = await fetchUsuarios();
    setMembers(usuarios.map(mapUsuarioToTeamMember));
  }

  const onlineCount = filteredTeamMembers.filter((member) => member.status === 'Online').length;
  const meetingCount = filteredTeamMembers.filter((member) => member.status === 'Em reunião').length;
  const offlineCount = filteredTeamMembers.filter((member) => member.status === 'Offline').length;

  return (
    <>
      <section className="panel stacked-panel">
        <div className="section-topbar">
          <div>
            <h3>Equipe</h3>
            <span>Pessoas, disponibilidade e atuação da operação</span>
          </div>
          <div className="section-actions">
            <button type="button" className="button button--primary section-create-button" onClick={() => setShowTeamCreateModal(true)}>
              ＋ Novo membro
            </button>
          </div>
        </div>

        {!profile.podeGerenciarCadastros ? (
          <p style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 8, background: 'rgba(255, 180, 80, 0.1)', border: '1px solid rgba(255, 180, 80, 0.35)', fontSize: '0.95rem' }}>
            <strong>Aprovar cadastros pendentes</strong> só é permitido para <strong>CEO</strong>, <strong>Compliance</strong> ou <strong>Membro do Conselho</strong>.
          </p>
        ) : null}

        <div className="team-highlights-grid">
          {[
            { label: 'Membros ativos', value: `${filteredTeamMembers.length}`, note: 'visíveis no filtro atual' },
            { label: 'Online', value: `${onlineCount}`, note: 'disponíveis agora' },
            { label: 'Em reunião', value: `${meetingCount}`, note: 'em atendimento' },
            { label: 'Offline', value: `${offlineCount}`, note: 'fora do expediente' },
          ].map((item) => (
            <article key={item.label} className="team-highlight-card">
              <small>{item.label}</small>
              <strong>{item.value}</strong>
              <span>{item.note}</span>
            </article>
          ))}
        </div>

        {profile.podeGerenciarCadastros ? (
          <div className="pending-approvals-banner" style={{ marginBottom: 20, padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(66, 190, 232, 0.35)', background: 'rgba(66, 190, 232, 0.08)' }}>
            <div>
              <strong style={{ display: 'block', marginBottom: 4 }}>Cadastros aguardando aprovação</strong>
              <small style={{ opacity: 0.85 }}>Apenas CEO, Compliance ou Membro do Conselho podem aprovar novos acessos.</small>
            </div>
            {cadastroApproveFeedback ? (
              <p role="status" style={{ marginTop: 12, marginBottom: 0 }}>{cadastroApproveFeedback.message}</p>
            ) : null}
            {cadastrosPendentesLoading ? <p style={{ marginTop: 12, marginBottom: 0 }}>Carregando…</p> : null}
            {!cadastrosPendentesLoading && cadastrosPendentes.length === 0 ? <p style={{ marginTop: 12, marginBottom: 0, opacity: 0.85 }}>Nenhuma conta pendente no momento.</p> : null}
            {!cadastrosPendentesLoading && cadastrosPendentes.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cadastrosPendentes.map((user) => (
                  <li key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '10px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.2)' }}>
                    <span>
                      <strong>{user.nomeCompleto}</strong>
                      <small style={{ display: 'block', opacity: 0.85 }}>{user.email}</small>
                    </span>
                    <button type="button" className="button button--primary" disabled={aprovarCadastroId === user.id} onClick={() => handleAprovarCadastroUsuario(user.id)}>
                      {aprovarCadastroId === user.id ? 'Aprovando…' : 'Aprovar'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="team-grid">
          {filteredTeamMembers.map((member) => (
            <article key={member.id ?? member.email} className="team-member-card" onClick={() => setSelectedTeamMember(member)}>
              <div className="team-member-header">
                <div className="team-member-identity">
                  <div className="team-member-avatar">{member.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
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
                  <strong>{member.status === 'Online' ? 'Disponível' : member.status === 'Em reunião' ? 'Ocupado' : 'Indisponível'}</strong>
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
            </article>
          ))}
        </div>
      </section>

      <TeamMemberModal member={selectedTeamMember} onClose={() => setSelectedTeamMember(null)} />
      <TeamCreateModal open={showTeamCreateModal} onClose={() => setShowTeamCreateModal(false)} onCreated={handleCreated} />
    </>
  );
}
