import { useEffect, useMemo, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import { fetchAuthMe, profileFromAuthMe } from './services/auth';
import { ACCESS_TOKEN_KEY } from './services/api';
import { useAppDispatch } from './store/hooks';
import { updateProfile } from './store/profileSlice';

type AuthRoute = '/login' | '/forgot-password';

function getAuthRoute(): AuthRoute {
  return window.location.pathname === '/forgot-password' ? '/forgot-password' : '/login';
}

function navigateTo(path: AuthRoute) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function App() {
  const dispatch = useAppDispatch();
  const initialAuthenticated = useMemo(() => !!localStorage.getItem(ACCESS_TOKEN_KEY), []);
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [authRoute, setAuthRoute] = useState<AuthRoute>(getAuthRoute);

  useEffect(() => {
    const syncRoute = () => setAuthRoute(getAuthRoute());
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('climbe_token');
    const pending = params.get('oauth_pending');
    const err = params.get('oauth_error');
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      setAuthenticated(true);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    if (pending === '1') {
      window.alert('Cadastro recebido. Aguarde a aprovação de um administrador.');
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (err) {
      window.alert(`Login com Google: ${decodeURIComponent(err)}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!authenticated || !localStorage.getItem(ACCESS_TOKEN_KEY)) {
      return;
    }
    let cancelled = false;
    fetchAuthMe()
      .then((me) => {
        if (!cancelled) dispatch(updateProfile(profileFromAuthMe(me)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [authenticated, dispatch]);

  function handleLogin(accessToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    setAuthenticated(true);
  }

  function handleLogout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setAuthenticated(false);
    navigateTo('/login');
  }

  return (
    <div className="app-shell">
      {authenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : authRoute === '/forgot-password' ? (
        <ForgotPassword onBackToLogin={() => navigateTo('/login')} />
      ) : (
        <Login
          onLogin={handleLogin}
          onForgotPassword={() => navigateTo('/forgot-password')}
        />
      )}
    </div>
  );
}

export default App;
