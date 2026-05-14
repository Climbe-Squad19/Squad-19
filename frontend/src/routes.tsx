import { createBrowserRouter, Navigate, useNavigate } from "react-router-dom"

import { AuthLayout } from "./pages/_layout/auth"
import AppLayout from "./components/layout/app-layout"
import AgendaPage from "./pages/app/agenda"
import DashboardPage from "./pages/app/dashboard"
import ProposalsPage from "./pages/app/proposals"
import SettingsPage from "./pages/app/settings"
import TeamPage from "./pages/app/team"
import CompaniesPage from "./pages/app/companies"
import { ForgotPassword } from "./pages/auth/forgot-password"
import { Login } from "./pages/auth/login"

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
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
    ]
  },
])