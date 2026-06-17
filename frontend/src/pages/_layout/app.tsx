import { useEffect, useState } from "react";
import { Navigate, Outlet, useSearchParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks"; // Importante: conectando o Redux
import Toolbar from "../../components/layout/toolbar";
import Sidebar from "../../components/layout/sidebar";
import { ACCESS_TOKEN_KEY } from "../../services/api";
import { fetchAuthMe, profileFromAuthMe } from "../../services/auth";
import { updateProfile } from "../../store/profileSlice";

export function AppLayout() {
  // 1. Busca e URL
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') ?? '';
  const climbeToken = searchParams.get('climbe_token');
  const oauthError = searchParams.get('oauth_error');
  const oauthPending = searchParams.get('oauth_pending');

  // Salva o token do callback Google OAuth antes de qualquer verificação de auth
  if (climbeToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, climbeToken);
  }

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const [isAuthChecked, setIsAuthChecked] = useState(!!token);

  const handleSearch = (value: string) => {
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  useEffect(() => {
    if (!token) {
      setIsAuthChecked(true);
      return;
    }

    let isMounted = true;
    const loadProfile = async () => {
      try {
        const authMe = await fetchAuthMe();
        if (!isMounted) return;
        dispatch(updateProfile(profileFromAuthMe(authMe)));
      } catch (error) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        if (isMounted) {
          navigate('/login', { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsAuthChecked(true);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [dispatch, navigate, token]);

  // 2. Resgatando os dados do Redux (que estavam no monolito antigo)
  const profile = useAppSelector((state) => state.profile);

  // 3. Estados locais de controle da casca do layout
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLightSurfaceMode, setIsLightSurfaceMode] = useState(false);

  // 4. Lógica derivada (iniciais do usuário para o Avatar)
  const userInitials = profile?.fullName
    ?.split(' ')
    ?.filter(Boolean)
    ?.slice(0, 2)
    ?.map((part) => part[0]?.toUpperCase() ?? '')
    ?.join('') || 'U';

  if (!token) {
    if (oauthError) {
      return <Navigate to={`/login?oauth_error=${encodeURIComponent(oauthError)}`} replace />;
    }
    if (oauthPending) {
      return <Navigate to="/login?oauth_pending=1" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Após salvar o token do OAuth, limpa a URL redirecionando para o dashboard
  if (climbeToken) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAuthChecked) {
    return null;
  }

  return (
    <main className={`screen dashboard-screen ${isMobileSidebarOpen ? 'dashboard-screen--sidebar-open' : ''} ${isLightSurfaceMode ? 'dashboard-screen--light' : ''}`}>

      <button
        type="button"
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'sidebar-overlay--visible' : ''}`}
        aria-label="Fechar menu lateral"
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <Sidebar isLightMode={isLightSurfaceMode} />

      <section className="dashboard-content">
        <Toolbar
          fullName={profile?.fullName || 'Usuário'}
          role={profile?.role || 'Cargo'}
          userInitials={userInitials}
          isLightSurfaceMode={isLightSurfaceMode}
          onToggleSurfaceMode={() => setIsLightSurfaceMode(!isLightSurfaceMode)}
          mobileSidebarOpen={isMobileSidebarOpen}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}

          onOpenProfile={() => console.log('Abrir perfil')}
          onOpenNotifications={() => console.log('Abrir notificações')}
          pushNotification={() => { }}
          notificationItems={[]}
        />

        <Outlet context={{ search }} />
      </section>
    </main>
  );
}
