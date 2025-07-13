"use client"

import { createContext, useState, useContext, useEffect } from "react"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        localStorage.removeItem("user")
      }
    }
  }, [])

  const login = (userData) => {
    // Garantir que o administrador tenha todas as permissões
    if (userData.role === "admin") {
      userData.permissions = [
        "cadastros",
        "estoque",
        "abastecimento",
        "producao",
        "logistica",
        "rh",
        "compras",
        "financeiro",
        "comercial",
        "faturamento",
        "notas-fiscais",
        "workflow",
      ]
    } else {
      // Todos os usuários têm acesso ao módulo workflow
      if (!userData.permissions) userData.permissions = []
      if (!userData.permissions.includes("workflow")) {
        userData.permissions.push("workflow")
      }
    }

    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const updateUserPermissions = (newPermissions) => {
    if (user) {
      const updatedUser = { ...user, permissions: newPermissions }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const value = { user, login, logout, updateUserPermissions }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
