import { useEffect, useMemo, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import { ACCESS_TOKEN_KEY } from './services/api';

type AuthRoute = '/login' | '/forgot-password';

function getAuthRoute(): AuthRoute {
  return window.location.pathname === '/forgot-password' ? '/forgot-password' : '/login';
}

function navigateTo(path: AuthRoute) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function App() {
  const initialAuthenticated = useMemo(() => !!localStorage.getItem(ACCESS_TOKEN_KEY), []);
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [authRoute, setAuthRoute] = useState<AuthRoute>(getAuthRoute);

  useEffect(() => {
    const syncRoute = () => setAuthRoute(getAuthRoute());
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

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
