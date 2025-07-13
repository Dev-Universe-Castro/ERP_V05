"use client"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet"
import { useNavigate } from "react-router-dom"
import {
  Users,
  Package,
  Fuel,
  Factory,
  Truck,
  UserCheck,
  ShoppingCart,
  DollarSign,
  ShoppingBag,
  LogOut,
  Settings,
  Bell,
  BarChart3,
  CheckCircle,
  TrendingUp,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useData } from "@/contexts/DataContext"
import { toast } from "@/components/ui/use-toast"

const modules = [
  {
    id: "cadastros",
    title: "Cadastros",
    description: "Dados mestres: clientes, fornecedores, produtos",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
  },
  {
    id: "workflow",
    title: "Workflow",
    description: "Requisições e aprovações",
    icon: CheckCircle,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200",
  },
  {
    id: "estoque",
    title: "Estoque",
    description: "Controle de estoque em tempo real",
    icon: Package,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
  },
  {
    id: "abastecimento",
    title: "Abastecimento",
    description: "Controle de frota e equipamentos",
    icon: Fuel,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
  },
  {
    id: "producao",
    title: "Produção",
    description: "Ordens de produção e planejamento",
    icon: Factory,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200",
  },
  {
    id: "logistica",
    title: "Logística",
    description: "Romaneios, fretes e expedição",
    icon: Truck,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-200",
  },
  {
    id: "rh",
    title: "RH",
    description: "Recursos humanos e folha de pagamento",
    icon: UserCheck,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    borderColor: "border-pink-200",
  },
  {
    id: "compras",
    title: "Compras",
    description: "Requisições, cotações e pedidos",
    icon: ShoppingCart,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    borderColor: "border-indigo-200",
  },
  {
    id: "financeiro",
    title: "Financeiro",
    description: "Contas a pagar/receber e fluxo de caixa",
    icon: DollarSign,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    borderColor: "border-emerald-200",
  },
  {
    id: "comercial",
    title: "Comercial",
    description: "Pedidos de venda, propostas e faturamento",
    icon: ShoppingBag,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    borderColor: "border-cyan-200",
  },
  {
    id: "faturamento",
    title: "Faturamento",
    description: "Emissão de NFe e comunicação com SEFAZ",
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200",
  },
  {
    id: "notas-fiscais",
    title: "Notas Fiscais",
    description: "Busca e armazenamento de NFes da SEFAZ",
    icon: FileText,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    borderColor: "border-indigo-200",
  },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { data } = useData()

  const handleModuleClick = (moduleId) => {
    if (user.permissions.includes(moduleId)) {
      navigate(`/module/${moduleId}`)
    } else {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar este módulo.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    })
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getQuickStats = () => {
    return {
      clientes: data.clientes?.length || 0,
      produtos: data.produtos?.length || 0,
      ordensProducao: data.ordensProducao?.filter((op) => op.status === "em-andamento").length || 0,
      pedidosVenda: data.pedidosVenda?.length || 0,
    }
  }

  const stats = getQuickStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Dashboard - ERP FertiCore</title>
        <meta
          name="description"
          content="Dashboard principal do sistema ERP com acesso a todos os módulos de gestão empresarial."
        />
      </Helmet>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/4cd8d26e-17de-4418-8aea-8511bad9fc35/792c2a1fa0ddae5de74a2f3eee93364d.png"
                alt="FertiCore Logo"
                className="h-10"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-800"
                onClick={() =>
                  toast({
                    description:
                      "🚧 Notificações não implementadas ainda—mas não se preocupe! Você pode solicitar isso no seu próximo prompt! 🚀",
                  })
                }
              >
                <Bell className="h-5 w-5" />
                <span className="notification-dot bg-red-500 border-white"></span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-800"
                onClick={() =>
                  toast({
                    description:
                      "🚧 Configurações não implementadas ainda—mas não se preocupe! Você pode solicitar isso no seu próximo prompt! 🚀",
                  })
                }
              >
                <Settings className="h-5 w-5" />
              </Button>

              {user.role === "admin" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-gray-800"
                  onClick={() => navigate("/admin/users")}
                >
                  <UserCheck className="h-5 w-5" />
                </Button>
              )}

              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-green-600 text-white">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500 hover:text-red-500">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo, {user.name}!</h2>
          <p className="text-gray-600">Selecione um módulo para começar a trabalhar</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Clientes</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.clientes}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Produtos</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.produtos}</p>
                </div>
                <Package className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">OPs Ativas</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.ordensProducao}</p>
                </div>
                <Factory className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pedidos Venda</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.pedidosVenda}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Módulos do Sistema
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {modules.map((module, index) => {
              const hasPermission = user.permissions.includes(module.id)
              const IconComponent = module.icon

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card
                    className={`module-card cursor-pointer ${
                      hasPermission ? "hover:border-green-500" : "opacity-60 cursor-not-allowed"
                    } ${module.borderColor}`}
                    onClick={() => handleModuleClick(module.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-3`}>
                        <IconComponent className={`h-6 w-6 ${module.color}`} />
                      </div>
                      <CardTitle className="text-gray-800 text-lg">{module.title}</CardTitle>
                      <CardDescription className="text-gray-500 text-sm">{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            hasPermission
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {hasPermission ? "Acesso Liberado" : "Sem Permissão"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm">ERP FertiCore - Gestão Integrada Empresarial</p>
        </motion.div>
      </div>
    </div>
  )
}