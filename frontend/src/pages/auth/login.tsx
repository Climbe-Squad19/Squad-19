import { useEffect, useState } from 'react';
import '../../index.css'
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ACCESS_TOKEN_KEY, API_BASE_URL } from '../../services/api';
import { fetchGoogleOAuthDisponivel, login } from '../../services/auth';
import googleLogo from '../../assets/google.svg';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleOAuthDisponivel, setGoogleOAuthDisponivel] = useState<boolean | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('oauth_error');
  const oauthPending = searchParams.get('oauth_pending');

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

    try {
      const response = await login({ email: email.trim(), senha: password });
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao fazer login. Verifique suas credenciais e tente novamente.');
    }
  };

  return (
    <section className='w-full min-h-screen flex flex-col items-center justify-center'>
      <div className='flex flex-col items-center justify-center gap-4 min-w-80'>
        <h2 className='text-lg font-bold'>Acessar sistema</h2>
        <form onSubmit={handleSubmit} className='w-full flex flex-col items-center justify-center gap-4 max-w-79'>
          <label className='text-sm font-bold text-zinc-100 w-full flex flex-col gap-3'>
            Seu e-mail
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='flex flex-1 w-full rounded-md bg-transparent border border-zinc-700 px-3 py-2 text-sm text-zinc-100 outlie-none disabled:cursor-not-allowed focus-within:outline-none focus-within:ring-2 focus-within:ring-zinc-800 focus-within:ring-offset-2 focus-within:ring-offset-zinc-950'
              required
            />
          </label>

          <label className='text-sm font-bold text-zinc-100 w-full flex flex-col gap-3'>
            Sua senha
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='flex flex-1 w-full rounded-md bg-transparent border border-zinc-700 px-3 py-2 text-sm text-zinc-100 outlie-none disabled:cursor-not-allowed focus-within:outline-none focus-within:ring-2 focus-within:ring-zinc-800 focus-within:ring-offset-2 focus-within:ring-offset-zinc-950'
              required
            />
          </label>

          <div className="w-full flex items-center justify-between gap-4">
            <Link to='/portal/login' className="underline text-xs font-medium">Entrar como empresa</Link>
            <Link to='/forgot-password' className="underline text-xs font-medium">Esqueceu a senha?</Link>
          </div>

          <div className='flex flex-col w-full items-center'>
            <button type="submit" className="w-full bg-[#79C6C0]/30 flex py-2 items-center justify-center gap-3 rounded-md text-sm font-bold cursor-pointer hover:bg-[#79C6C0]/20 transition-all">
              Entrar
            </button>
          </div>
        </form>

        {oauthError && (
          <p className="text-red-400 text-sm text-center w-full max-w-79">
            Erro ao entrar com Google: {decodeURIComponent(oauthError).replace(/_/g, ' ')}
          </p>
        )}
        {oauthPending && (
          <p className="text-yellow-400 text-sm text-center w-full max-w-79">
            Sua conta aguarda aprovação do administrador.
          </p>
        )}

        <div className="max-w-79 w-full flex items-center gap-2">
          <div className="w-full border-t border-zinc-700" />
          <p className="text-sm font-semibold">ou</p>
          <div className="w-full border-t border-zinc-700" />
        </div>

        {googleOAuthDisponivel === false && (
          <p className="text-zinc-500 text-xs text-center w-full max-w-79">
            Login com Google indisponível: configure <code>GOOGLE_CLIENT_ID</code> e{' '}
            <code>GOOGLE_CLIENT_SECRET</code> no back-end.
          </p>
        )}

        <button
          type="button"
          className="w-full bg-transparent border border-zinc-600 flex items-center justify-center py-2 gap-4 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          disabled={googleOAuthDisponivel !== true}
          title={googleOAuthDisponivel === false ? 'Credenciais Google OAuth não configuradas na API' : undefined}
          onClick={() => {
            window.location.href = `${API_BASE_URL}/auth/google`;
          }}
        >
          <img src={googleLogo} alt="" />
          Continuar com Google
        </button>
      </div>
    </section>
  );
}
