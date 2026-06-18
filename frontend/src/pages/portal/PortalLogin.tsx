import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  portalLogin,
  savePortalToken,
  getPortalToken,
  cadastrarEmpresaPortal,
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

function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function maskTelefone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

const inputClass =
  'flex flex-1 w-full rounded-md bg-transparent border border-zinc-700 px-3 py-2 text-sm text-zinc-100 outline-none disabled:cursor-not-allowed focus-within:ring-2 focus-within:ring-zinc-800 focus-within:ring-offset-2 focus-within:ring-offset-zinc-950';

const labelClass = 'text-sm font-bold text-zinc-100 w-full flex flex-col gap-2';

export function PortalLogin() {
  const [tab, setTab] = useState<'entrar' | 'cadastrar'>('entrar');

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginCnpj, setLoginCnpj] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Cadastro
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [emailContato, setEmailContato] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nomeRepresentante, setNomeRepresentante] = useState('');
  const [cpfRepresentante, setCpfRepresentante] = useState('');
  const [cadastroSubmitting, setCadastroSubmitting] = useState(false);

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
      if (!token) throw new Error('Resposta de login inválida');
      savePortalToken(token);
      navigate('/portal/propostas');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Credenciais inválidas. Verifique e-mail e CNPJ.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleCadastro = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCadastroSubmitting(true);
    try {
      await cadastrarEmpresaPortal({
        razaoSocial: razaoSocial.trim(),
        nomeFantasia: nomeFantasia.trim() || undefined,
        cnpj: cnpj.replace(/\D/g, ''),
        emailContato: emailContato.trim(),
        telefone: telefone.trim() || undefined,
        nomeRepresentante: nomeRepresentante.trim() || undefined,
        cpfRepresentante: cpfRepresentante.replace(/\D/g, '') || undefined,
      });

      toast.success('Empresa cadastrada com sucesso! Entrando no portal...');

      // Auto-login após cadastro
      const response = await portalLogin({
        email: emailContato.trim(),
        cnpj: cnpj.replace(/\D/g, ''),
      });
      const token = response.accessToken ?? response.token;
      if (!token) throw new Error('Cadastro realizado, mas não foi possível fazer login automático.');
      savePortalToken(token);
      navigate('/portal/propostas');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar empresa. Tente novamente.');
    } finally {
      setCadastroSubmitting(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 w-full max-w-sm px-4">

        {/* Abas */}
        <div className="w-full flex rounded-lg border border-zinc-700 overflow-hidden">
          <button
            type="button"
            onClick={() => setTab('entrar')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              tab === 'entrar'
                ? 'bg-[#79C6C0]/20 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setTab('cadastrar')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              tab === 'cadastrar'
                ? 'bg-[#79C6C0]/20 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cadastrar empresa
          </button>
        </div>

        {/* Aba: Entrar */}
        {tab === 'entrar' && (
          <>
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
          </>
        )}

        {/* Aba: Cadastrar */}
        {tab === 'cadastrar' && (
          <>
            <h2 className="text-lg font-bold self-start">Cadastrar empresa</h2>
            <form onSubmit={handleCadastro} className="w-full flex flex-col gap-4">
              <label className={labelClass}>
                Razão Social *
                <input
                  type="text"
                  placeholder="Empresa Ltda."
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  className={inputClass}
                  required
                />
              </label>

              <label className={labelClass}>
                Nome Fantasia
                <input
                  type="text"
                  placeholder="Opcional"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                CNPJ *
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(maskCnpj(e.target.value))}
                  className={inputClass}
                  maxLength={18}
                  required
                />
              </label>

              <label className={labelClass}>
                Email de contato *
                <input
                  type="email"
                  placeholder="contato@empresa.com"
                  value={emailContato}
                  onChange={(e) => setEmailContato(e.target.value)}
                  className={inputClass}
                  required
                />
              </label>

              <label className={labelClass}>
                Telefone
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(maskTelefone(e.target.value))}
                  className={inputClass}
                  maxLength={15}
                />
              </label>

              <label className={labelClass}>
                Nome do responsável
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={nomeRepresentante}
                  onChange={(e) => setNomeRepresentante(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                CPF do responsável
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpfRepresentante}
                  onChange={(e) => setCpfRepresentante(maskCpf(e.target.value))}
                  className={inputClass}
                  maxLength={14}
                />
              </label>

              <button
                type="submit"
                disabled={cadastroSubmitting}
                className="w-full bg-[#79C6C0]/30 flex py-2 items-center justify-center gap-3 rounded-md text-sm font-bold cursor-pointer hover:bg-[#79C6C0]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cadastroSubmitting ? 'Cadastrando...' : 'Cadastrar e entrar'}
              </button>

              <p className="text-xs text-zinc-500 text-center">
                Já tem cadastro?{' '}
                <button
                  type="button"
                  onClick={() => setTab('entrar')}
                  className="text-[#79C6C0] underline cursor-pointer"
                >
                  Faça login
                </button>
              </p>
            </form>
          </>
        )}

        <div className="w-full flex justify-center mt-2">
          <Link to="/login" className="text-zinc-500 text-xs underline">
            Entrar como funcionário Climbe
          </Link>
        </div>
      </div>
    </section>
  );
}
