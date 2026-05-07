import { useState, type FormEvent } from 'react';
import { createUsuario } from '../../services/usuarios';
import { TEAM_CARGO_OPTIONS } from '../../utils/cargo';

type TeamCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export default function TeamCreateModal({ open, onClose, onCreated }: TeamCreateModalProps) {
  const [teamFormName, setTeamFormName] = useState('');
  const [teamFormCpf, setTeamFormCpf] = useState('');
  const [teamFormEmail, setTeamFormEmail] = useState('');
  const [teamFormPhone, setTeamFormPhone] = useState('');
  const [teamFormRole, setTeamFormRole] = useState<string>(TEAM_CARGO_OPTIONS[0].value);
  const [teamFormPermissions, setTeamFormPermissions] = useState<string[]>([TEAM_CARGO_OPTIONS[0].value]);
  const [teamFormPassword, setTeamFormPassword] = useState('');
  const [teamFormPasswordConfirm, setTeamFormPasswordConfirm] = useState('');
  const [teamFormSubmitting, setTeamFormSubmitting] = useState(false);
  const [teamFormError, setTeamFormError] = useState('');

  if (!open) {
    return null;
  }

  function resetForm() {
    setTeamFormName('');
    setTeamFormCpf('');
    setTeamFormEmail('');
    setTeamFormPhone('');
    setTeamFormRole(TEAM_CARGO_OPTIONS[0].value);
    setTeamFormPermissions([TEAM_CARGO_OPTIONS[0].value]);
    setTeamFormPassword('');
    setTeamFormPasswordConfirm('');
    setTeamFormError('');
  }

  function toggleTeamPermission(cargoValue: string) {
    setTeamFormPermissions((current) =>
      current.includes(cargoValue)
        ? current.filter((item) => item !== cargoValue)
        : [...current, cargoValue]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTeamFormError('');

    if (!teamFormName.trim() || !teamFormCpf.trim() || !teamFormEmail.trim() || !teamFormPhone.trim() || !teamFormRole.trim()) {
      setTeamFormError('Preencha todos os campos obrigatórios do colaborador.');
      return;
    }

    if (teamFormPermissions.length === 0) {
      setTeamFormError('Selecione pelo menos uma permissão (cargos).');
      return;
    }

    const cpfDigits = teamFormCpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      setTeamFormError('CPF deve conter 11 dígitos.');
      return;
    }

    if (!teamFormPassword.trim() || teamFormPassword.length < 6) {
      setTeamFormError('Senha inicial deve ter pelo menos 6 caracteres.');
      return;
    }

    if (teamFormPassword !== teamFormPasswordConfirm) {
      setTeamFormError('A confirmação da senha não confere.');
      return;
    }

    let permissoes = [...new Set(teamFormPermissions)];
    if (!permissoes.includes(teamFormRole)) {
      permissoes = [teamFormRole, ...permissoes];
    }

    setTeamFormSubmitting(true);
    try {
      await createUsuario({
        nomeCompleto: teamFormName.trim(),
        cargo: teamFormRole,
        permissoes,
        cpf: cpfDigits,
        email: teamFormEmail.trim().toLowerCase(),
        telefone: teamFormPhone.trim(),
        senha: teamFormPassword,
      });
      await onCreated();
      resetForm();
      onClose();
    } catch (error) {
      setTeamFormError(error instanceof Error ? error.message : 'Não foi possível cadastrar o colaborador.');
    } finally {
      setTeamFormSubmitting(false);
    }
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section className="dialog-card" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <div>
            <h3>Novo Colaborador</h3>
            <span>Cadastre um novo integrante da equipe</span>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>✕</button>
        </div>

        <form className="team-create-form" onSubmit={handleSubmit}>
          <div className="team-create-grid">
            <label>
              Nome Completo
              <input type="text" value={teamFormName} onChange={(event) => setTeamFormName(event.target.value)} required />
            </label>
            <label>
              CPF
              <input type="text" value={teamFormCpf} onChange={(event) => setTeamFormCpf(event.target.value)} required />
            </label>
            <label>
              E-mail
              <input type="email" value={teamFormEmail} onChange={(event) => setTeamFormEmail(event.target.value)} required />
            </label>
            <label>
              Contato
              <input type="text" value={teamFormPhone} onChange={(event) => setTeamFormPhone(event.target.value)} required />
            </label>
            <label>
              Cargo
              <select value={teamFormRole} onChange={(event) => setTeamFormRole(event.target.value)} required>
                {TEAM_CARGO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Senha inicial
              <input type="password" autoComplete="new-password" value={teamFormPassword} onChange={(event) => setTeamFormPassword(event.target.value)} minLength={6} required />
            </label>
            <label>
              Confirmar senha
              <input type="password" autoComplete="new-password" value={teamFormPasswordConfirm} onChange={(event) => setTeamFormPasswordConfirm(event.target.value)} minLength={6} required />
            </label>
          </div>

          <p className="team-create-hint" style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.85 }}>
            Novos colaboradores são criados como <strong>ativos</strong>. Permissões correspondem aos cargos no sistema.
          </p>

          <div className="team-create-permissions">
            <span>Permissões (cargos)</span>
            <div className="team-permissions-grid">
              {TEAM_CARGO_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`team-permission-chip ${teamFormPermissions.includes(option.value) ? 'active' : ''}`}
                  onClick={() => toggleTeamPermission(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {teamFormError ? <p className="form-error">{teamFormError}</p> : null}

          <div className="dialog-actions">
            <button type="button" className="button button--outline" onClick={onClose} disabled={teamFormSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="button button--primary" disabled={teamFormSubmitting}>
              {teamFormSubmitting ? 'Salvando…' : 'Salvar colaborador'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
