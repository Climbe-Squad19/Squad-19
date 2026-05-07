import { teamFocuses } from '../../mocks/team.mock';
import type { TeamMember } from '../../types';

type TeamMemberModalProps = {
  member: TeamMember | null;
  onClose: () => void;
};

export default function TeamMemberModal({ member, onClose }: TeamMemberModalProps) {
  if (!member) {
    return null;
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section className="dialog-card" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <div>
            <h3>{member.name}</h3>
            <span>{member.role}</span>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>✕</button>
        </div>
        <div className="team-detail-grid">
          <article className="team-member-meta-item">
            <span>CPF</span>
            <strong>{member.cpf}</strong>
          </article>
          <article className="team-member-meta-item">
            <span>E-mail</span>
            <strong>{member.email}</strong>
          </article>
          <article className="team-member-meta-item">
            <span>Contato</span>
            <strong>{member.phone}</strong>
          </article>
          <article className="team-member-meta-item">
            <span>Status</span>
            <strong>{member.status}</strong>
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
              {member.permissions.map((permission) => (
                <span key={permission} className="team-permission-chip">{permission}</span>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
