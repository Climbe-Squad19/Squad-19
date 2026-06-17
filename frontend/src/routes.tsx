import { createBrowserRouter, Navigate } from "react-router-dom"

import { AuthLayout } from "./pages/_layout/auth"
import AgendaPage from "./pages/app/agenda"
import DashboardPage from "./pages/app/dashboard"
import ProposalsPage from "./pages/app/proposals"
import SettingsPage from "./pages/app/settings"
import TeamPage from "./pages/app/team"
import CompaniesPage from "./pages/app/companies"
import { ForgotPassword } from "./pages/auth/forgot-password"
import { Login } from "./pages/auth/login"
import { AppLayout } from "./pages/_layout/app"
import { PortalLayout } from "./pages/portal/PortalLayout"
import { PortalLogin } from "./pages/portal/PortalLogin"
import PortalPropostasPage from "./pages/portal/PortalPropostas"
import PortalReunioesPage from "./pages/portal/PortalReunioes"
import PortalDocumentosPage from "./pages/portal/PortalDocumentos"

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: '/dashboard',
        element: <DashboardPage />
      },
      {
        path: '/agenda',
        element: <AgendaPage />
      },
      {
        path: '/propostas',
        element: <ProposalsPage />
      },
      {
        path: '/empresas',
        element: <CompaniesPage />
      },
      {
        path: '/equipe',
        element: <TeamPage />
      },
      {
        path: '/configuracoes',
        element: <SettingsPage />
      },
    ]
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />
      },
      {
        path: '/portal/login',
        element: <PortalLogin />
      },
    ]
  },
  {
    path: '/portal',
    element: <PortalLayout />,
    children: [
      {
        path: 'propostas',
        element: <PortalPropostasPage />
      },
      {
        path: 'reunioes',
        element: <PortalReunioesPage />
      },
      {
        path: 'documentos',
        element: <PortalDocumentosPage />
      },
    ]
  },
])
