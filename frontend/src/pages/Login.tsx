import { useEffect, useState } from 'react';
import { ACCESS_TOKEN_KEY, API_BASE_URL } from '../services/api';
import { fetchGoogleOAuthDisponivel, login } from '../services/auth';
import '../index.css'
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState(false);
  const [googleOAuthDisponivel, setGoogleOAuthDisponivel] = useState<boolean | null>(null);

  const navigate = useNavigate()

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
      const response = await login({ email: email.trim(), senha: password })
      .then(response => {
        localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
        navigate('/dashboard')
      });
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

          <div className="w-full flex justify-end">
            <Link to='/forgot-password' className="underline text-xs font-medium">Esqueceu a senha?</Link>
          </div>

          <div className='flex flex-col w-full items-center'>
            <button type="submit" className="w-full bg-[#79C6C0]/30 flex py-2 items-center justify-center gap-3 rounded-md text-sm font-bold cursor-pointer hover:bg-[#79C6C0]/20 transition-all">
              Entrar
            </button>
          </div>
        </form>

        <div className="max-w-79 w-full flex items-center gap-2">
          <div className="w-full border-t border-zinc-700" />
          <p className="text-sm font-semibold">ou</p>
          <div className="w-full border-t border-zinc-700" />
        </div>

        <button
          type="button"
          className="w-full bg-transparent border border-zinc-600 flex items-center justify-center py-2 gap-4 rounded-lg cursor-pointer text-sm font-semibold"
          // disabled={googleOAuthDisponivel !== true}
          onClick={() => {
            window.location.href = `${API_BASE_URL}/auth/google`;
          }}
        >
          <img src="https://raw.githubusercontent.com/Climbe-Squad19/climbe-frontend/9eb6d581f368cf55af43231555515173be8bf912/src/assets/google.svg" alt="" />
          Continuar com Google
        </button>
      </div>
    </section>
  );
}
