import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  portalLogin,
  savePortalToken,
  getPortalToken,
  PORTAL_TOKEN_KEY,
  PORTAL_EMPRESA_KEY,
} from '../../services/portal';

export { PORTAL_TOKEN_KEY, PORTAL_EMPRESA_KEY };

function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

const inputClass =
  'flex flex-1 w-full rounded-md bg-transparent border border-zinc-700 px-3 py-2 text-sm text-zinc-100 outline-none disabled:cursor-not-allowed focus-within:ring-2 focus-within:ring-zinc-800 focus-within:ring-offset-2 focus-within:ring-offset-zinc-950';

const labelClass = 'text-sm font-bold text-zinc-100 w-full flex flex-col gap-2';

export function PortalLogin() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginCnpj, setLoginCnpj] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (getPortalToken()) {
      navigate('/portal/propostas');
    }
  }, [navigate]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginSubmitting(true);
    try {
      const response = await portalLogin({
        email: loginEmail.trim(),
        cnpj: loginCnpj.replace(/\D/g, ''),
      });
      const token = response.accessToken ?? response.token;
      if (!token) throw new Error('Resposta de login invalida');
      savePortalToken(token);
      navigate('/portal/propostas');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Credenciais invalidas. Verifique e-mail e CNPJ.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 w-full max-w-sm px-4">
        <h2 className="text-lg font-bold self-start">Acesso ao Portal</h2>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <label className={labelClass}>
            Email da empresa
            <input
              type="email"
              placeholder="contato@empresa.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className={inputClass}
              required
            />
          </label>

          <label className={labelClass}>
            CNPJ
            <input
              type="text"
              placeholder="00.000.000/0000-00"
              value={loginCnpj}
              onChange={(e) => setLoginCnpj(maskCnpj(e.target.value))}
              className={inputClass}
              maxLength={18}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loginSubmitting}
            className="w-full bg-[#79C6C0]/30 flex py-2 items-center justify-center gap-3 rounded-md text-sm font-bold cursor-pointer hover:bg-[#79C6C0]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="w-full flex justify-center mt-2">
          <Link to="/login" className="text-zinc-500 text-xs underline">
            Entrar como funcionario Climbe
          </Link>
        </div>
      </div>
    </section>
  );
}
