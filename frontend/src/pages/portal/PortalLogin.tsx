import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  portalLogin,
  savePortalToken,
  getPortalToken,
  PORTAL_TOKEN_KEY,
  PORTAL_EMPRESA_KEY,
} from '../../services/portal';

export { PORTAL_TOKEN_KEY, PORTAL_EMPRESA_KEY };

export function PortalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getPortalToken()) {
      navigate('/portal/propostas');
    }
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await portalLogin({
        email: email.trim(),
        cnpj: password.replace(/\D/g, ''),
      });

      const token = response.accessToken ?? response.token;
      if (!token) {
        throw new Error('Resposta de login inválida');
      }

      savePortalToken(token);
      navigate('/portal/propostas');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 min-w-80">
        <h2 className="text-lg font-bold">Acesso ao Portal</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center justify-center gap-4 max-w-79">
          <label className="text-sm font-bold text-zinc-100 w-full flex flex-col gap-3">
            Email da empresa
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex flex-1 w-full rounded-md bg-transparent border border-zinc-700 px-3 py-2 text-sm text-zinc-100 outline-none disabled:cursor-not-allowed focus-within:ring-2 focus-within:ring-zinc-800 focus-within:ring-offset-2 focus-within:ring-offset-zinc-950"
              required
            />
          </label>

          <label className="text-sm font-bold text-zinc-100 w-full flex flex-col gap-3">
            CNPJ (sem formatação)
            <input
              type="password"
              placeholder="00000000000000"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex flex-1 w-full rounded-md bg-transparent border border-zinc-700 px-3 py-2 text-sm text-zinc-100 outline-none disabled:cursor-not-allowed focus-within:ring-2 focus-within:ring-zinc-800 focus-within:ring-offset-2 focus-within:ring-offset-zinc-950"
              required
            />
          </label>

          <div className="flex flex-col w-full items-center">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#79C6C0]/30 flex py-2 items-center justify-center gap-3 rounded-md text-sm font-bold cursor-pointer hover:bg-[#79C6C0]/20 transition-all"
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
