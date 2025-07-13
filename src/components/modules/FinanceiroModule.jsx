
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  PiggyBank,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Calculator,
  Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/use-toast'
import { useFinanceiro } from '../../hooks/useFinanceiro'
import { useAuditLog } from '../../hooks/useAuditLog'
import { useData } from '../../contexts/DataContext'
import CompliancePanel from '../common/CompliancePanel'
import FinanceiroStats from './financeiro/FinanceiroStats'
import ContasTab from './financeiro/ContasTab'
import FluxoTab from './financeiro/FluxoTab'
import ReceitasTab from './financeiro/ReceitasTab'
import DespesasTab from './financeiro/DespesasTab'

const complianceRules = [
  {
    id: 'financial_controls',
    name: 'Controles Financeiros',
    description: 'Segregação de funções e aprovações em dia',
    category: 'Governança'
  },
  {
    id: 'cash_reconciliation',
    name: 'Conciliação Bancária',
    description: 'Conciliações realizadas mensalmente',
    category: 'Controle'
  },
  {
    id: 'budget_control',
    name: 'Controle Orçamentário',
    description: 'Monitoramento vs orçado',
    category: 'Planejamento'
  },
  {
    id: 'tax_compliance',
    name: 'Conformidade Fiscal',
    description: 'Obrigações fiscais em dia',
    category: 'Fiscal'
  },
  {
    id: 'financial_reporting',
    name: 'Relatórios Financeiros',
    description: 'DRE e Balanço atualizados',
    category: 'Reporting'
  }
]

export default function FinanceiroModule({ activeSection }) {
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('atual')
  
  const financeiro = useFinanceiro()
  const { logAction } = useAuditLog()
  const { toast } = useToast()
  const { searchItems } = useData()

  // Buscar dados reais
  const data = {
    contasReceber: financeiro.titulosReceber.getAll(),
    contasPagar: financeiro.titulosPagar.getAll(),
    receitas: financeiro.receitas.getAll(),
    despesas: financeiro.despesas.getAll(),
    contasFinanceiras: financeiro.contasFinanceiras.getAll(),
    fluxoCaixa: []
  }

  const getIndicadores = () => {
    const contasReceberTotal = data.contasReceber.reduce((acc, conta) => acc + conta.valor, 0)
    const contasPagarTotal = data.contasPagar.reduce((acc, conta) => acc + conta.valor, 0)
    const receitasTotal = data.receitas.reduce((acc, receita) => acc + receita.valor, 0)
    const despesasTotal = data.despesas.reduce((acc, despesa) => acc + despesa.valor, 0)
    const contasVencidas = data.contasReceber.filter(conta => conta.status === 'vencida').length

    return {
      saldoCaixa: 125000, // Simulado
      contasReceber: contasReceberTotal,
      contasPagar: contasPagarTotal,
      receitasMes: receitasTotal,
      despesasMes: despesasTotal,
      resultadoMes: receitasTotal - despesasTotal,
      contasVencidas,
      liquidezCorrente: 2.34, // Simulado
      margemLiquida: 15.7 // Simulado
    }
  }

  const handleConciliacaoBancaria = async () => {
    setLoading(true)
    try {
      const contas = financeiro.contasFinanceiras.getAll()
      if (contas.length > 0) {
        const resultado = await financeiro.conciliarConta(contas[0].id, { saldoFinal: contas[0].saldo })
        if (resultado) {
          toast({
            title: "Conciliação Realizada",
            description: `Status: ${resultado.status}`
          })
        }
      }
    } catch (error) {
      toast({
        title: "Erro na Conciliação",
        description: "Erro ao realizar conciliação bancária",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGerarRelatorio = async (tipo) => {
    setLoading(true)
    try {
      const dataInicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const dataFim = new Date().toISOString().split('T')[0]
      
      let resultado = null
      
      if (tipo === 'DRE') {
        resultado = financeiro.gerarDRE(dataInicio, dataFim)
      } else if (tipo === 'Fluxo') {
        resultado = financeiro.gerarFluxoCaixa(dataInicio, dataFim)
      }
      
      if (resultado) {
        toast({
          title: "Relatório Gerado",
          description: `Relatório ${tipo} gerado com sucesso!`
        })
        console.log(`Relatório ${tipo}:`, resultado)
      }
    } catch (error) {
      toast({
        title: "Erro no Relatório",
        description: `Erro ao gerar relatório ${tipo}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const indicadores = getIndicadores()

  if (activeSection === 'overview' || activeSection === 'dashboard') {
    return (
      <div className="p-6 space-y-6">
        {/* Indicadores Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Saldo em Caixa</p>
                    <p className="text-2xl font-bold text-green-700">
                      R$ {indicadores.saldoCaixa.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% vs mês anterior
                    </p>
                  </div>
                  <PiggyBank className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Contas a Receber</p>
                    <p className="text-2xl font-bold text-blue-700">
                      R$ {indicadores.contasReceber.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {indicadores.contasVencidas} vencidas
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Contas a Pagar</p>
                    <p className="text-2xl font-bold text-red-700">
                      R$ {indicadores.contasPagar.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-yellow-600 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Próx. venc: 2 dias
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Resultado do Mês</p>
                    <p className="text-2xl font-bold text-purple-700">
                      R$ {indicadores.resultadoMes.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-purple-600 flex items-center mt-1">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Margem: {indicadores.margemLiquida}%
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Indicadores Secundários */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Liquidez Corrente</p>
                    <p className="text-xl font-bold text-gray-900">{indicadores.liquidezCorrente}</p>
                  </div>
                  <Shield className="h-6 w-6 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receitas do Mês</p>
                    <p className="text-xl font-bold text-green-600">
                      R$ {indicadores.receitasMes.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Despesas do Mês</p>
                    <p className="text-xl font-bold text-red-600">
                      R$ {indicadores.despesasMes.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Painel de Governança e Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <CompliancePanel module="financeiro" complianceRules={complianceRules} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <FinanceiroStats data={data} indicadores={indicadores} />
          </motion.div>
        </div>

        {/* Ações e Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Alertas Financeiros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Contas Vencidas</p>
                    <p className="text-xs text-red-600">{indicadores.contasVencidas} contas a receber vencidas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Vencimentos Próximos</p>
                    <p className="text-xs text-yellow-600">3 contas vencem nos próximos 7 dias</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Meta Atingida</p>
                    <p className="text-xs text-green-600">Resultado do mês 15% acima da meta</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-16 flex-col gap-2" onClick={handleConciliacaoBancaria}>
                    <CreditCard className="h-5 w-5" />
                    Conciliação Bancária
                  </Button>
                  <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => handleGerarRelatorio('DRE')}>
                    <FileText className="h-5 w-5" />
                    Gerar DRE
                  </Button>
                  <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => handleGerarRelatorio('Balanço')}>
                    <BarChart3 className="h-5 w-5" />
                    Gerar Balanço
                  </Button>
                  <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => handleGerarRelatorio('Fluxo')}>
                    <Calculator className="h-5 w-5" />
                    Fluxo de Caixa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Renderização das seções específicas
  switch (activeSection) {
    case 'contas':
      return <ContasTab financeiroHook={financeiro} indicadores={indicadores} />
    case 'fluxo':
      return <FluxoTab financeiroHook={financeiro} />
    case 'receitas':
      return <ReceitasTab financeiroHook={financeiro} />
    case 'despesas':
      return <DespesasTab financeiroHook={financeiro} />
    default:
      return (
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Seção não encontrada</h3>
              <p className="text-gray-600">A seção solicitada não existe ou está em desenvolvimento.</p>
            </CardContent>
          </Card>
        </div>
      )
  }
}
