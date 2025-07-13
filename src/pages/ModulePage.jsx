"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet"
import { ArrowLeft, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"

import CadastrosModule from "@/components/modules/CadastrosModule"
import EstoqueModule from "@/components/modules/EstoqueModule"
import AbastecimentoModule from "@/components/modules/AbastecimentoModule"
import ProducaoModule from "@/components/modules/ProducaoModule"
import LogisticaModule from "@/components/modules/LogisticaModule"
import RHModule from "@/components/modules/RHModule"
import ComprasModule from "@/components/modules/ComprasModule"
import FinanceiroModule from "@/components/modules/FinanceiroModule"
import ComercialModule from "@/components/modules/ComercialModule"
import FaturamentoModule from "@/components/modules/FaturamentoModule"
import NotasFiscaisModule from "@/components/modules/NotasFiscaisModule"
import WorkflowModule from "@/components/modules/WorkflowModule"

const moduleConfig = {
  cadastros: { component: CadastrosModule, name: "Cadastros", defaultSection: "clientes" },
  estoque: { component: EstoqueModule, name: "Estoque", defaultSection: "posicao" },
  abastecimento: { component: AbastecimentoModule, name: "Abastecimento", defaultSection: "equipamentos" },
  producao: { component: ProducaoModule, name: "Produção", defaultSection: "ordens" },
  logistica: { component: LogisticaModule, name: "Logística", defaultSection: "romaneios" },
  rh: { component: RHModule, name: "Recursos Humanos", defaultSection: "funcionarios" },
  compras: { component: ComprasModule, name: "Compras", defaultSection: "requisicoes" },
  financeiro: { component: FinanceiroModule, name: "Financeiro", defaultSection: "overview" },
  comercial: { component: ComercialModule, name: "Comercial", defaultSection: "pedidos" },
  faturamento: { component: FaturamentoModule, name: "Faturamento", defaultSection: "dashboard" },
  "notas-fiscais": { component: NotasFiscaisModule, name: "Notas Fiscais", defaultSection: "dashboard" },
  workflow: { component: WorkflowModule, name: "Workflow", defaultSection: "minhas-requisicoes" },
}

export default function ModulePage() {
  const { moduleId, sectionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

  const config = moduleConfig[moduleId]

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!sectionId && config) {
      navigate(`/module/${moduleId}/${config.defaultSection}`, { replace: true })
    }
  }, [moduleId, sectionId, navigate, config])

  if (!user || !user.permissions || !user.permissions.includes(moduleId)) {
    toast({
      title: "Acesso negado",
      description: "Você não tem permissão para acessar este módulo.",
      variant: "destructive",
    })
    navigate("/dashboard")
    return null
  }

  if (!config) {
    navigate("/dashboard")
    return null
  }

  const { component: ModuleComponent, name: moduleName } = config
  const activeSection = sectionId || config.defaultSection

  const handleSectionChange = (newSectionId) => {
    navigate(`/module/${moduleId}/${newSectionId}`)
    if (!isDesktop) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Helmet>
        <title>{moduleName} - ERP FertiCore</title>
        <meta
          name="description"
          content={`Módulo ${moduleName} do sistema ERP FertiCore para gestão empresarial integrada.`}
        />
      </Helmet>

      {/* Overlay para mobile */}
      {sidebarOpen && !isDesktop && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : sidebarOpen ? 0 : -300,
        }}
        transition={{ duration: 0.3 }}
        className={`${isDesktop ? "relative" : "fixed"} inset-y-0 left-0 z-50 w-64 sidebar-gradient`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">{moduleName}</h2>
              {!isDesktop && (
                <Button variant="ghost" size="icon" className="text-gray-600" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Módulo de {moduleName.toLowerCase()}</p>
          </div>

          <div className="flex-1 p-4">
            <ModuleComponent.Sidebar activeSection={activeSection} setActiveSection={handleSectionChange} />
          </div>

          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!isDesktop && (
                  <Button variant="ghost" size="icon" className="text-gray-600" onClick={() => setSidebarOpen(true)}>
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                <div>
                  <h1 className="text-2xl font-bold gradient-text">{moduleName}</h1>
                  <p className="text-sm text-gray-500">
                    Usuário: {user.name} • Função: {user.role}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="hidden md:flex bg-transparent"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <ModuleComponent activeSection={activeSection} />
        </main>
      </div>
    </div>
  )
}