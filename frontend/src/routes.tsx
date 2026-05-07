import { createBrowserRouter, Navigate, useNavigate } from "react-router-dom"

import Login from "./pages/Login"
import AgendaPage from "./pages/AgendaPage"
import CompaniesPage from "./pages/CompaniesPage"
import DashboardPage from "./pages/DashboardPage"
import ProposalsPage from "./pages/ProposalsPage"
import SettingsPage from "./pages/SettingsPage"
import TeamPage from "./pages/TeamPage"
import { AuthLayout } from "./pages/_layout/auth"
import ForgotPassword from "./pages/ForgotPassword"
import AppLayout from "./components/layout/AppLayout"

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