import { FormEvent, useMemo, useState } from 'react';
import { forgotPassword, resetPassword } from '../services/auth';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState(false);
  const tokenFromUrl = useMemo(() => new URLSearchParams(window.location.search).get('token') ?? '', []);

  const tokenValue = token || tokenFromUrl;

  const handleRequestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback('');
    try {
      const message = await forgotPassword(email.trim());
      setFeedback(message || 'Enviamos as instrucoes para o seu Gmail.');
      setFeedbackError(false);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel enviar o email de recuperacao.');
      setFeedbackError(true);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback('');
    try {
      const message = await resetPassword(tokenValue.trim(), newPassword);
      setFeedback(message || 'Senha redefinida com sucesso.');
      setFeedbackError(false);
      setToken('');
      setNewPassword('');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel redefinir a senha.');
      setFeedbackError(true);
    }
  };

  return (
    <main className="screen login-screen">
      <section className="login-panel login-panel--brand">
        <div>
          <span className="brand-tag">climbe</span>
          <h1>Recupere seu acesso em poucos passos</h1>
          <p>
            Informe seu Gmail para receber o link/token de recuperacao e redefina sua senha com seguranca.
          </p>
        </div>
      </section>

      <section className="login-panel login-panel--form">
        <div className="login-card">
          <small>Recuperacao de Senha</small>
          <h2>Esqueci minha senha</h2>

          <form onSubmit={handleRequestReset} className="login-form">
            <label>
              Gmail para recuperacao
              <input
                type="email"
                placeholder="seuemail@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="button button--primary">Enviar no Gmail</button>
          </form>

          <form onSubmit={handleResetPassword} className="login-form" style={{ marginTop: 16 }}>
            <label>
              Token de recuperacao
              <input
                type="text"
                placeholder="Cole o token recebido"
                value={tokenValue}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </label>
            <label>
              Nova senha
              <input
                type="password"
                placeholder="Minimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="button button--outline">Redefinir senha</button>
          </form>

          {feedback && (
            <p className={feedbackError ? 'form-error' : ''} style={{ marginTop: 12 }}>
              {feedback}
            </p>
          )}

          <div className="login-actions login-actions--stacked">
            <button type="button" className="button button--text login-back-button" onClick={onBackToLogin}>
              Voltar para login
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
