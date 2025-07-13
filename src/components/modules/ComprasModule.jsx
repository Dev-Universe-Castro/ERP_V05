
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Plus,
  Download,
  Upload
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/use-toast'
import { useCompras } from '../../hooks/useCompras'
import { useAuditLog } from '../../hooks/useAuditLog'
import { useData } from '../../contexts/DataContext'
import CompliancePanel from '../common/CompliancePanel'
import RequisicoesTab from './compras/RequisicoesTab'
import CotacoesTab from './compras/CotacoesTab'
import PedidosTab from './compras/PedidosTab'
import AprovacoesTab from './compras/AprovacoesTab'
import ComprasStats from './compras/ComprasStats'

const complianceRules = [
  {
    id: 'supplier_homologation',
    name: 'Homologação de Fornecedores',
    description: 'Fornecedores devidamente homologados e avaliados',
    category: 'Qualidade'
  },
  {
    id: 'purchase_policy',
    name: 'Política de Compras',
    description: 'Processos seguindo política corporativa',
    category: 'Governança'
  },
  {
    id: 'cost_control',
    name: 'Controle de Custos',
    description: 'Monitoramento de variações de preços',
    category: 'Financeiro'
  },
  {
    id: 'contract_management',
    name: 'Gestão de Contratos',
    description: 'Contratos válidos e em conformidade',
    category: 'Legal'
  }
]

export default function ComprasModule({ activeSection }) {
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('30days')
  
  const compras = useCompras()
  const { logAction } = useAuditLog()
  const { toast } = useToast()
  const { searchItems } = useData()

  // Buscar dados reais
  const data = {
    requisicoes: compras.requisicoes.getAll(),
    cotacoes: compras.cotacoes.getAll(),
    pedidos: compras.pedidos.getAll(),
    aprovacoes: compras.aprovacoes.getAll()
  }

  const getStats = () => {
    const estatisticas = compras.getEstatisticas()
    return {
      requisicoesPendentes: estatisticas.requisicoes.pendentes,
      cotacoesAbertas: estatisticas.cotacoes.emAnalise,
      pedidosAndamento: estatisticas.pedidos.enviados + estatisticas.pedidos.confirmados,
      aprovacoesPendentes: estatisticas.aprovacoes.pendentes,
      valorMesAtual: estatisticas.pedidos.valorTotal,
      economiaGerada: 15750 // Simulado - pode ser calculado com base nas cotações
    }
  }

  const handleExportData = (type) => {
    // Simular exportação
    toast({
      title: "Exportação iniciada",
      description: `Dados de ${type} sendo exportados...`
    })
    
    logAction('export', 'compras', null, { type, format: 'excel' })
  }

  const handleImportData = (type) => {
    // Simular importação
    toast({
      title: "Importação disponível",
      description: `Funcionalidade de importação de ${type} em desenvolvimento.`
    })
  }

  const stats = getStats()

  if (activeSection === 'dashboard' || activeSection === 'overview') {
    return (
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Requisições</p>
                    <p className="text-xl font-bold text-orange-600">{stats.requisicoesPendentes}</p>
                    <p className="text-xs text-gray-500">Pendentes</p>
                  </div>
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cotações</p>
                    <p className="text-xl font-bold text-blue-600">{stats.cotacoesAbertas}</p>
                    <p className="text-xs text-gray-500">Em análise</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pedidos</p>
                    <p className="text-xl font-bold text-green-600">{stats.pedidosAndamento}</p>
                    <p className="text-xs text-gray-500">Em andamento</p>
                  </div>
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aprovações</p>
                    <p className="text-xl font-bold text-red-600">{stats.aprovacoesPendentes}</p>
                    <p className="text-xs text-gray-500">Pendentes</p>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valor Mês</p>
                    <p className="text-xl font-bold text-purple-600">
                      R$ {stats.valorMesAtual.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-500">Total pedidos</p>
                  </div>
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Economia</p>
                    <p className="text-xl font-bold text-green-600">
                      R$ {stats.economiaGerada.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-500">Este mês</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Compliance e Stats detalhados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <CompliancePanel module="compras" complianceRules={complianceRules} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <ComprasStats data={data} />
          </motion.div>
        </div>

        {/* Ações Rápidas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Plus className="h-5 w-5" />
                  Nova Requisição
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Search className="h-5 w-5" />
                  Buscar Cotação
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleExportData('pedidos')}>
                  <Download className="h-5 w-5" />
                  Exportar Dados
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleImportData('fornecedores')}>
                  <Upload className="h-5 w-5" />
                  Importar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Renderização das seções específicas
  switch (activeSection) {
    case 'requisicoes':
      return <RequisicoesTab comprasHook={compras} />
    case 'cotacoes':
      return <CotacoesTab comprasHook={compras} />
    case 'pedidos':
      return <PedidosTab comprasHook={compras} />
    case 'aprovacoes':
      return <AprovacoesTab comprasHook={compras} />
    default:
      return (
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Seção não encontrada</h3>
              <p className="text-gray-600">A seção solicitada não existe ou está em desenvolvimento.</p>
            </CardContent>
          </Card>
        </div>
      )
  }
}
