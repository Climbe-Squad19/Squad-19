import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../services/api';
import { fetchGoogleOAuthDisponivel, login } from '../services/auth';

interface LoginProps {
  onLogin: (accessToken: string) => void;
  onForgotPassword: () => void;
}

export default function Login({ onLogin, onForgotPassword }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState(false);
  const [googleOAuthDisponivel, setGoogleOAuthDisponivel] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchGoogleOAuthDisponivel().then((ok) => {
      if (!cancelled) setGoogleOAuthDisponivel(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback('');

    try {
      const response = await login({ email: email.trim(), senha: password });
      onLogin(response.accessToken);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível realizar o login.');
      setFeedbackError(true);
    }
  };

  return (
    <main className="screen login-screen">
      <section className="login-panel login-panel--brand">
        <div>
          <span className="brand-tag">climbe</span>
          <h1>O melhor investimento precisa da melhor orientação!</h1>
          <p>
            Acesse sua conta para gerenciar contratos, propostas e reuniões com
            um fluxo intuitivo e focado em resultados.
          </p>
        </div>
      </section>

      <section className="login-panel login-panel--form">
        <div className="login-card">
          <small>Login e Autenticação</small>
          <h2>Acessar sistema</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <label>
              Seu e-mail
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              Sua senha
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <div className="login-actions">
              <button type="submit" className="button button--primary">
                Entrar
              </button>
              <a
                href="#"
                className="login-link"
                onClick={(event) => {
                  event.preventDefault();
                  onForgotPassword();
                  setFeedback('');
                  setFeedbackError(false);
                }}
              >
                Esqueceu a senha?
              </a>
            </div>
          </form>

          {feedback && (
            <p className={feedbackError ? 'form-error' : ''} style={{ marginTop: 12 }}>
              {feedback}
            </p>
          )}

          <div className="login-divider">ou</div>
          {googleOAuthDisponivel === false && (
            <p className="form-error" style={{ marginBottom: 12, fontSize: '0.9rem' }}>
              Login com Google está indisponível: configure <code>GOOGLE_CLIENT_ID</code> e{' '}
              <code>GOOGLE_CLIENT_SECRET</code> no ambiente da API e reinicie o back-end.
            </p>
          )}
          <button
            type="button"
            className="button button--outline"
            disabled={googleOAuthDisponivel !== true}
            title={
              googleOAuthDisponivel === false
                ? 'Credenciais Google OAuth não configuradas na API'
                : undefined
            }
            onClick={() => {
              window.location.href = `${API_BASE_URL}/auth/google`;
            }}
          >
            Continuar com Google
          </button>
        </div>
      </section>
    </main>
  );
}
