"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Users, UserPlus, Search, Edit, Trash2, Shield, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"
import UserPermissionsModal from "@/components/admin/UserPermissionsModal"

// Mock data para usuários
const mockUsers = [
  {
    id: 1,
    name: "Administrador",
    email: "admin@erp.com",
    role: "admin",
    status: "ativo",
    lastLogin: "2024-01-25 14:30",
    permissions: [
      "cadastros",
      "estoque",
      "abastecimento",
      "producao",
      "logistica",
      "rh",
      "compras",
      "financeiro",
      "comercial",
      "workflow",
    ],
  },
  {
    id: 2,
    name: "João Silva",
    email: "joao@erp.com",
    role: "user",
    status: "ativo",
    lastLogin: "2024-01-25 10:15",
    permissions: ["cadastros", "estoque", "comercial", "workflow"],
  },
  {
    id: 3,
    name: "Maria Santos",
    email: "maria@erp.com",
    role: "user",
    status: "ativo",
    lastLogin: "2024-01-24 16:45",
    permissions: ["financeiro", "comercial", "workflow"],
  },
  {
    id: 4,
    name: "Pedro Costa",
    email: "pedro@erp.com",
    role: "user",
    status: "inativo",
    lastLogin: "2024-01-20 09:30",
    permissions: ["producao", "estoque", "workflow"],
  },
  {
    id: 5,
    name: "Ana Oliveira",
    email: "ana@erp.com",
    role: "user",
    status: "ativo",
    lastLogin: "2024-01-25 11:20",
    permissions: ["rh", "cadastros", "workflow"],
  },
]

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [roleFilter, setRoleFilter] = useState("todos")
  const [selectedUser, setSelectedUser] = useState(null)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)

  // Verificar se o usuário é admin
  if (!user || user.role !== "admin") {
    navigate("/dashboard")
    return null
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || u.status === statusFilter
    const matchesRole = roleFilter === "todos" || u.role === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusBadge = (status) => {
    return status === "ativo"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200"
  }

  const getRoleBadge = (role) => {
    return role === "admin"
      ? "bg-purple-100 text-purple-800 border-purple-200"
      : "bg-blue-100 text-blue-800 border-blue-200"
  }

  const toggleUserStatus = (userId) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: u.status === "ativo" ? "inativo" : "ativo" } : u)))

    const user = users.find((u) => u.id === userId)
    toast({
      title: "Status atualizado",
      description: `Usuário ${user.name} foi ${user.status === "ativo" ? "desativado" : "ativado"}.`,
    })
  }

  const openPermissionsModal = (user) => {
    setSelectedUser(user)
    setShowPermissionsModal(true)
  }

  const handlePermissionsUpdate = (userId, newPermissions) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, permissions: newPermissions } : u)))

    toast({
      title: "Permissões atualizadas",
      description: "As permissões do usuário foram atualizadas com sucesso.",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Administração de Usuários - ERP FertiCore</title>
        <meta name="description" content="Gerenciamento de usuários e permissões do sistema ERP" />
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Administração de Usuários</h1>
                <p className="text-sm text-gray-500">Gerencie usuários e suas permissões</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter((u) => u.status === "ativo").length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Administradores</p>
                  <p className="text-2xl font-bold text-purple-600">{users.filter((u) => u.role === "admin").length}</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Usuários Inativos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter((u) => u.status === "inativo").length}
                  </p>
                </div>
                <EyeOff className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gerenciamento de Usuários
                  </CardTitle>
                  <CardDescription>Controle de acesso e permissões dos usuários</CardDescription>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Funções</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-700">Usuário</th>
                      <th className="text-left p-4 font-medium text-gray-700">Função</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Último Login</th>
                      <th className="text-left p-4 font-medium text-gray-700">Permissões</th>
                      <th className="text-left p-4 font-medium text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback className="bg-blue-600 text-white">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-800">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs border ${getRoleBadge(user.role)}`}>
                            {user.role === "admin" ? "Administrador" : "Usuário"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusBadge(user.status)}`}>
                            {user.status === "ativo" ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">{user.lastLogin}</td>
                        <td className="p-4">
                          <span className="text-sm text-gray-600">
                            {user.permissions.length} módulo{user.permissions.length !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openPermissionsModal(user)}
                              title="Gerenciar Permissões"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleUserStatus(user.id)}
                              title={user.status === "ativo" ? "Desativar" : "Ativar"}
                            >
                              {user.status === "ativo" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="ghost" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Excluir"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <UserPermissionsModal
          user={selectedUser}
          isOpen={showPermissionsModal}
          onClose={() => {
            setShowPermissionsModal(false)
            setSelectedUser(null)
          }}
          onSave={handlePermissionsUpdate}
        />
      )}
    </div>
  )
}
