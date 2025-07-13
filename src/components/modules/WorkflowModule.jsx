
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Users, 
  BarChart3,
  Settings,
  Filter,
  Search,
  Plus,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/use-toast'
import { useWorkflow } from '../../hooks/useWorkflow'
import { useAuditLog } from '../../hooks/useAuditLog'
import { useData } from '../../contexts/DataContext'
import WorkflowSteps from '../common/WorkflowSteps'
import CompliancePanel from '../common/CompliancePanel'
import NovaRequisicaoModal from './workflow/NovaRequisicaoModal'
import DetalhesWorkflowModal from './workflow/DetalhesWorkflowModal'

const workflowTypes = [
  {
    id: 'purchase_request',
    name: 'Requisição de Compra',
    description: 'Processo de solicitação e aprovação de compras',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    steps: [
      { name: 'Solicitação', description: 'Criação da requisição', assignee: 'Solicitante', duration: '1 dia' },
      { name: 'Análise Técnica', description: 'Validação técnica do produto', assignee: 'Equipe Técnica', duration: '2 dias' },
      { name: 'Aprovação Orçamentária', description: 'Validação de orçamento', assignee: 'Controller', duration: '1 dia' },
      { name: 'Aprovação Gerencial', description: 'Aprovação final', assignee: 'Gerente', duration: '1 dia' },
      { name: 'Cotação', description: 'Busca de fornecedores', assignee: 'Compras', duration: '3 dias' },
      { name: 'Pedido', description: 'Emissão do pedido', assignee: 'Compras', duration: '1 dia' }
    ]
  },
  {
    id: 'production_order',
    name: 'Ordem de Produção',
    description: 'Processo de criação e execução de ordens de produção',
    icon: Settings,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    steps: [
      { name: 'Planejamento', description: 'Definição da ordem', assignee: 'PCP', duration: '1 dia' },
      { name: 'Liberação de Materiais', description: 'Separação de insumos', assignee: 'Estoque', duration: '1 dia' },
      { name: 'Produção', description: 'Execução da produção', assignee: 'Operação', duration: '5 dias' },
      { name: 'Controle de Qualidade', description: 'Inspeção do produto', assignee: 'Qualidade', duration: '1 dia' },
      { name: 'Finalização', description: 'Entrada no estoque', assignee: 'Estoque', duration: '1 dia' }
    ]
  },
  {
    id: 'hr_process',
    name: 'Processo de RH',
    description: 'Processos de recursos humanos e administrativos',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    steps: [
      { name: 'Solicitação', description: 'Abertura do processo', assignee: 'Funcionário', duration: '1 dia' },
      { name: 'Análise RH', description: 'Validação de documentos', assignee: 'RH', duration: '2 dias' },
      { name: 'Aprovação', description: 'Aprovação do processo', assignee: 'Gestor', duration: '1 dia' },
      { name: 'Execução', description: 'Implementação', assignee: 'RH', duration: '3 dias' }
    ]
  }
]

const statusConfig = {
  draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800', icon: FileText },
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  in_progress: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800', icon: Play },
  approved: { label: 'Aprovado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  completed: { label: 'Concluído', color: 'bg-purple-100 text-purple-800', icon: CheckCircle }
}

const WorkflowModule = ({ activeSection }) => {
  const [workflows, setWorkflows] = useState([])
  const [filteredWorkflows, setFilteredWorkflows] = useState([])
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNovaRequisicao, setShowNovaRequisicao] = useState(false)
  const [showDetalhes, setShowDetalhes] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  
  const { createWorkflow, updateWorkflowStatus, loading } = useWorkflow()
  const { logAction } = useAuditLog()
  const { toast } = useToast()
  const { searchItems } = useData()

  // Dados simulados
  useEffect(() => {
    const mockWorkflows = [
      {
        id: 1,
        type: 'purchase_request',
        title: 'Requisição de Matéria Prima - Fertilizante NPK',
        description: 'Solicitação de 10 toneladas de fertilizante NPK 10-10-10',
        status: 'in_progress',
        currentStep: 2,
        requester: 'João Silva',
        priority: 'high',
        createdAt: '2024-01-15T10:00:00Z',
        dueDate: '2024-01-25T17:00:00Z',
        value: 50000,
        tags: ['urgente', 'produção']
      },
      {
        id: 2,
        type: 'production_order',
        title: 'OP-2024-001 - Fertilizante Orgânico',
        description: 'Produção de 5 toneladas de fertilizante orgânico',
        status: 'pending',
        currentStep: 0,
        requester: 'Maria Santos',
        priority: 'medium',
        createdAt: '2024-01-16T14:30:00Z',
        dueDate: '2024-01-30T17:00:00Z',
        value: 25000,
        tags: ['produção', 'planejado']
      },
      {
        id: 3,
        type: 'hr_process',
        title: 'Solicitação de Férias - Carlos Oliveira',
        description: 'Período de férias de 30 dias',
        status: 'approved',
        currentStep: 3,
        requester: 'Carlos Oliveira',
        priority: 'low',
        createdAt: '2024-01-10T09:00:00Z',
        dueDate: '2024-01-20T17:00:00Z',
        value: 0,
        tags: ['rh', 'férias']
      }
    ]
    setWorkflows(mockWorkflows)
    setFilteredWorkflows(mockWorkflows)
  }, [])

  // Filtros
  useEffect(() => {
    let filtered = workflows

    if (selectedType !== 'all') {
      filtered = filtered.filter(w => w.type === selectedType)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(w => w.status === selectedStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.requester.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredWorkflows(filtered)
  }, [workflows, selectedType, selectedStatus, searchTerm])

  const handleWorkflowAction = (workflowId, action, comments = '') => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) return

    updateWorkflowStatus(workflowId, action, comments)
    
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: action, currentStep: action === 'approved' ? w.currentStep + 1 : w.currentStep }
        : w
    ))

    logAction(action, 'workflow', workflowId, { 
      workflowType: workflow.type, 
      title: workflow.title,
      comments 
    })
  }

  const handleCreateWorkflow = (workflowData) => {
    const newWorkflow = {
      id: Date.now(),
      ...workflowData,
      status: 'draft',
      currentStep: 0,
      createdAt: new Date().toISOString()
    }
    
    setWorkflows(prev => [newWorkflow, ...prev])
    createWorkflow(newWorkflow)
    logAction('create', 'workflow', newWorkflow.id, { type: workflowData.type })
  }

  const getWorkflowTypeConfig = (type) => {
    return workflowTypes.find(wt => wt.id === type) || workflowTypes[0]
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStats = () => {
    return {
      total: workflows.length,
      pending: workflows.filter(w => w.status === 'pending').length,
      inProgress: workflows.filter(w => w.status === 'in_progress').length,
      completed: workflows.filter(w => ['approved', 'completed'].includes(w.status)).length,
      avgTime: '3.2 dias' // Simulado
    }
  }

  const stats = getStats()

  if (activeSection === 'dashboard') {
    return (
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Workflows</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Concluídos</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Compliance Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <CompliancePanel module="workflow" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflows</h2>
          <p className="text-gray-600">Gerencie todos os processos e aprovações</p>
        </div>
        
        <Button onClick={() => setShowNovaRequisicao(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Workflow
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os tipos</option>
              {workflowTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os status</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Workflows */}
      <div className="grid gap-4">
        {filteredWorkflows.map((workflow) => {
          const typeConfig = getWorkflowTypeConfig(workflow.type)
          const TypeIcon = typeConfig.icon
          
          return (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-lg ${typeConfig.bgColor} flex items-center justify-center`}>
                    <TypeIcon className={`h-6 w-6 ${typeConfig.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{workflow.title}</h3>
                      {getStatusBadge(workflow.status)}
                      <Badge className={`text-xs ${getPriorityColor(workflow.priority)}`}>
                        {workflow.priority === 'high' ? 'Alta' : 
                         workflow.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{workflow.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Solicitante: {workflow.requester}</span>
                      <span>Criado: {new Date(workflow.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span>Prazo: {new Date(workflow.dueDate).toLocaleDateString('pt-BR')}</span>
                      {workflow.value > 0 && (
                        <span>Valor: R$ {workflow.value.toLocaleString('pt-BR')}</span>
                      )}
                    </div>

                    {/* Tags */}
                    {workflow.tags && workflow.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {workflow.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span>{workflow.currentStep + 1}/{typeConfig.steps.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${((workflow.currentStep + 1) / typeConfig.steps.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedWorkflow(workflow)
                      setShowDetalhes(true)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {workflow.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleWorkflowAction(workflow.id, 'approved')}
                      >
                        Aprovar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWorkflowAction(workflow.id, 'rejected')}
                      >
                        Rejeitar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredWorkflows.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum workflow encontrado</h3>
            <p className="text-gray-600">Não há workflows que correspondam aos filtros selecionados.</p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <NovaRequisicaoModal
        isOpen={showNovaRequisicao}
        onClose={() => setShowNovaRequisicao(false)}
        onSubmit={handleCreateWorkflow}
        workflowTypes={workflowTypes}
      />

      {selectedWorkflow && (
        <DetalhesWorkflowModal
          isOpen={showDetalhes}
          onClose={() => {
            setShowDetalhes(false)
            setSelectedWorkflow(null)
          }}
          workflow={selectedWorkflow}
          typeConfig={getWorkflowTypeConfig(selectedWorkflow.type)}
          onAction={handleWorkflowAction}
        />
      )}
    </div>
  )
}

// Sidebar component
WorkflowModule.Sidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'minhas-requisicoes', label: 'Minhas Requisições', icon: FileText },
    { id: 'aprovacoes', label: 'Aprovações', icon: CheckCircle },
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
  ]

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = activeSection === item.id
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
              isActive
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

export default WorkflowModule
