import { useEffect, useState, type FormEvent } from 'react';
import { SettingsSection } from '../../types';
import { updateProfile } from '../../store/profileSlice';
import { useIntegrations } from '../../hooks/use-integrations';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile);
  const { integrations, integrationsLoading, googleOAuthDisponivel, toggleIntegration } = useIntegrations();
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

  useEffect(() => {
    setSettingsName(profile.fullName);
    setSettingsPhone(profile.phone);
    setSettingsEmail(profile.email);
  }, [profile.email, profile.fullName, profile.phone]);

  function handleSaveProfileSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(updateProfile({ ...profile, fullName: settingsName.trim(), email: settingsEmail.trim(), phone: settingsPhone.trim() }));
  }

  function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!securityCurrentPassword || !securityNewPassword || securityNewPassword !== securityConfirmPassword) {
      return;
    }
    setSecurityCurrentPassword('');
    setSecurityNewPassword('');
    setSecurityConfirmPassword('');
  }

  return (
    <section className="panel stacked-panel">
      <div className="section-topbar">
        <div>
          <h3>Configurações</h3>
          <span>Conta, preferências e controle operacional</span>
        </div>
      </div>

      <div className="detail-tabs">
        {(['Meu Perfil', 'Segurança', 'Notificações', 'Integrações'] as SettingsSection[]).map((tab) => (
          <button key={tab} type="button" className={`detail-tab-button ${settingsSection === tab ? 'active' : ''}`} onClick={() => setSettingsSection(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {settingsSection === 'Meu Perfil' ? (
        <form className="settings-grid settings-form" onSubmit={handleSaveProfileSettings}>
          <label className="settings-item settings-item--stacked">
            <span>Nome completo</span>
            <input type="text" value={settingsName} onChange={(event) => setSettingsName(event.target.value)} />
          </label>
          <label className="settings-item settings-item--stacked">
            <span>Telefone</span>
            <input type="text" value={settingsPhone} onChange={(event) => setSettingsPhone(event.target.value)} />
          </label>
          <label className="settings-item settings-item--stacked settings-item--full">
            <span>E-mail principal</span>
            <input type="email" value={settingsEmail} onChange={(event) => setSettingsEmail(event.target.value)} />
          </label>
          <div className="settings-actions settings-item--full">
            <button type="button" className="button button--outline" onClick={() => setSettingsSection('Segurança')}>Alterar senha</button>
            <button type="submit" className="button button--primary">Salvar alterações</button>
          </div>
        </form>
      ) : null}

      {settingsSection === 'Segurança' ? (
        <form className="settings-grid settings-form" onSubmit={handleChangePassword}>
          <label className="settings-item settings-item--stacked settings-item--full">
            <span>Senha atual</span>
            <input type="password" value={securityCurrentPassword} onChange={(event) => setSecurityCurrentPassword(event.target.value)} />
          </label>
          <label className="settings-item settings-item--stacked">
            <span>Nova senha</span>
            <input type="password" value={securityNewPassword} onChange={(event) => setSecurityNewPassword(event.target.value)} />
          </label>
          <label className="settings-item settings-item--stacked">
            <span>Confirmar senha</span>
            <input type="password" value={securityConfirmPassword} onChange={(event) => setSecurityConfirmPassword(event.target.value)} />
          </label>
          <div className="settings-actions settings-item--full">
            <button type="submit" className="button button--primary">Atualizar senha</button>
          </div>
        </form>
      ) : null}

      {settingsSection === 'Notificações' ? (
  <div className="settings-grid">
    {([
      { label: 'Notificações no sistema', state: notificationsSystem, setter: setNotificationsSystem },
      { label: 'Notificações no e-mail', state: notificationsEmail, setter: setNotificationsEmail },
      { label: 'Alertas de prazo',        state: notificationsAlerts, setter: setNotificationsAlerts },
    ]).map(({ label, state, setter }) => (
      <label
        key={label}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        className="settings-item"
      >
        <span>{label}</span>
        <span
          onClick={() => setter((c) => !c)}
          style={{
            display: 'inline-flex',
            width: 44,
            height: 24,
            borderRadius: 999,
            background: state ? '#79C6C0' : 'rgba(255,255,255,0.1)',
            transition: 'background 0.2s',
            padding: 3,
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <span style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: state ? '#04121f' : '#9ab0d6',
            transform: state ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 0.2s, background 0.2s',
            display: 'block',
          }} />
        </span>
      </label>
    ))}
  </div>
) : null}

      {settingsSection === 'Integrações' ? (
        <div className="settings-grid">
          {googleOAuthDisponivel === false ? (
            <p className="settings-item settings-item--full form-error" style={{ marginBottom: 8 }}>
              Integrações Google exigem <code>GOOGLE_CLIENT_ID</code> e <code>GOOGLE_CLIENT_SECRET</code> na API.
            </p>
          ) : null}
          {(['googleDrive', 'googleCalendar', 'googleMeet', 'googleSheets', 'gmail'] as const).map((key) => (
            <article key={key} className="settings-item">
              <span>
                {key === 'gmail'
                  ? 'Gmail'
                  : key === 'googleSheets'
                    ? 'Google Sheets'
                    : key === 'googleMeet'
                      ? 'Google Meet'
                      : key === 'googleCalendar'
                        ? 'Google Calendar'
                        : 'Google Drive'}
              </span>
              <button
                type="button"
                className="button button--outline"
                disabled={integrationsLoading || (googleOAuthDisponivel !== true && !integrations[key])}
                onClick={() => void toggleIntegration(key)}
              >
                {integrations[key] ? 'Conectado' : 'Conectar'}
              </button>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}