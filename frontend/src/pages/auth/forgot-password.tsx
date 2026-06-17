import React, { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Trazendo navegação por rota
import { forgotPassword, resetPassword } from '../../services/auth';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState(false);

  const tokenFromUrl = useMemo(() => new URLSearchParams(window.location.search).get('token') ?? '', []);
  const tokenValue = token || tokenFromUrl;

  const navigate = useNavigate();

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
    <section className="w-full min-h-screen flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center justify-center gap-6 min-w-80 w-full max-w-80">

        <h2 className='text-lg font-bold'>Recuperar senha</h2>

        <form onSubmit={handleRequestReset} className="w-full flex flex-col gap-4">
          <label className="text-sm font-bold text-zinc-100 w-full flex flex-col gap-3">
            Seu e-mail
            <input
              type="email"
              placeholder="seuemail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex flex-1 w-full rounded-md bg-transparent border border-zinc-700 px-3 py-2 text-sm text-zinc-100 outlie-none disabled:cursor-not-allowed focus-within:outline-none focus-within:ring-2 focus-within:ring-zinc-800 focus-within:ring-offset-2 focus-within:ring-offset-zinc-950"
              required
            />
          </label>
          <button type="submit" className="w-full bg-[#79C6C0]/30 flex py-2 items-center justify-center gap-3 rounded-md text-sm font-bold cursor-pointer hover:bg-[#79C6C0]/20 transition-all">
            Solicitar token de recuperação
          </button>
        </form>

        {feedback && (
          <p className={`text-sm text-center ${feedbackError ? 'text-red-400' : 'text-green-400'}`}>
            {feedback}
          </p>
        )}

        <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-4 mt-4 border-t border-[rgba(255,255,255,0.08)] pt-6">
          <label className="text-sm font-bold text-zinc-100 flex flex-col gap-2">
            Token de recuperação
            <input
              type="text"
              placeholder="Cole o token recebido"
              value={tokenValue}
              onChange={(e) => setToken(e.target.value)}
              className="rounded-md bg-[rgba(11,17,30,0.82)] border border-[rgba(255,255,255,0.12)] px-3 py-2 text-sm text-zinc-100 focus-within:outline-none focus-within:ring-2 focus-within:ring-zinc-800"
              required
            />
          </label>
          <label className="text-sm font-bold text-zinc-100 flex flex-col gap-2">
            Nova senha
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-md bg-[rgba(11,17,30,0.82)] border border-[rgba(255,255,255,0.12)] px-3 py-2 text-sm text-zinc-100 focus-within:outline-none focus-within:ring-2 focus-within:ring-zinc-800"
              required
              minLength={6}
            />
          </label>
          <button type="submit" className="w-full bg-transparent border border-[#79C6C0]/50 py-2 rounded-md text-sm font-bold hover:bg-[#79C6C0]/10 transition-all">
            Redefinir senha
          </button>
        </form>

        <div className="w-full flex justify-center">
          <Link to='/login' className='text-[#9bc0ff] text-sm underline'>
            Voltar para login
          </Link>
        </div>
      </div>
    </section>
  );
}