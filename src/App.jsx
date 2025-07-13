"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import { Helmet } from "react-helmet"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { DataProvider } from "@/contexts/DataContext"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import DashboardPage from "@/pages/DashboardPage"
import ModulePage from "@/pages/ModulePage"
import AdminUsersPage from "@/pages/AdminUsersPage"

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  return user && user.role === "admin" ? children : <Navigate to="/dashboard" />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" />
}

function AppContent() {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>ERP FertiCore - Sistema Integrado de Gestão</title>
        <meta
          name="description"
          content="Sistema ERP completo para gestão integrada de cadastros, estoque, produção, logística, RH, compras e finanças."
        />
      </Helmet>

      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/module/:moduleId/:sectionId?"
          element={
            <ProtectedRoute>
              <ModulePage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/module/:moduleId" element={<Navigate to="/module/:moduleId/overview" replace />} />
      </Routes>

      <Toaster />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  )
}

export default App
