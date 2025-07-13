
import { useCallback } from 'react'
import { useCRUD } from './useCRUD'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/ui/use-toast'
import { useAuditLog } from './useAuditLog'

export const useFinanceiro = () => {
  const receitasCRUD = useCRUD('receitas')
  const despesasCRUD = useCRUD('despesas')
  const contasCRUD = useCRUD('contas')
  const titulosPagarCRUD = useCRUD('titulosPagar')
  const titulosReceberCRUD = useCRUD('titulosReceber')
  const contasFinanceirasCRUD = useCRUD('contasFinanceiras')
  
  const { baixarTitulo, queryItems } = useData()
  const { toast } = useToast()
  const { logAction } = useAuditLog()

  // === RECEITAS ===
  const criarReceita = useCallback(async (dados) => {
    try {
      const novaReceita = {
        ...dados,
        status: 'recebido',
        dataRecebimento: dados.data || new Date().toISOString()
      }

      const receita = await receitasCRUD.create(novaReceita)
      
      if (receita) {
        // Atualizar saldo da conta financeira se especificada
        if (dados.contaFinanceiraId) {
          await atualizarSaldoConta(dados.contaFinanceiraId, dados.valor, 'entrada')
        }
        
        logAction('revenue_created', 'receitas', receita.id, { valor: dados.valor })
      }

      return receita
    } catch (error) {
      console.error('Erro ao criar receita:', error)
      return null
    }
  }, [receitasCRUD, logAction])

  // === DESPESAS ===
  const criarDespesa = useCallback(async (dados) => {
    try {
      const novaDespesa = {
        ...dados,
        status: dados.status || 'pago',
        dataPagamento: dados.data || new Date().toISOString()
      }

      const despesa = await despesasCRUD.create(novaDespesa)
      
      if (despesa) {
        // Atualizar saldo da conta financeira se especificada
        if (dados.contaFinanceiraId) {
          await atualizarSaldoConta(dados.contaFinanceiraId, dados.valor, 'saida')
        }
        
        logAction('expense_created', 'despesas', despesa.id, { valor: dados.valor })
      }

      return despesa
    } catch (error) {
      console.error('Erro ao criar despesa:', error)
      return null
    }
  }, [despesasCRUD, logAction])

  // === CONTAS FINANCEIRAS ===
  const atualizarSaldoConta = useCallback(async (contaId, valor, tipo) => {
    try {
      const conta = contasFinanceirasCRUD.getById(contaId)
      if (!conta) return null

      const novoSaldo = tipo === 'entrada' 
        ? conta.saldo + valor 
        : conta.saldo - valor

      const contaAtualizada = await contasFinanceirasCRUD.update(contaId, {
        saldo: novoSaldo,
        ultimaMovimentacao: new Date().toISOString()
      })

      if (contaAtualizada) {
        logAction('balance_update', 'contasFinanceiras', contaId, {
          saldoAnterior: conta.saldo,
          novoSaldo,
          movimento: { tipo, valor }
        })
      }

      return contaAtualizada
    } catch (error) {
      console.error('Erro ao atualizar saldo da conta:', error)
      return null
    }
  }, [contasFinanceirasCRUD, logAction])

  // === TÍTULOS A PAGAR ===
  const pagarTitulo = useCallback(async (tituloId, dadosPagamento = {}) => {
    try {
      const titulo = titulosPagarCRUD.getById(tituloId)
      if (!titulo || titulo.status === 'pago') {
        toast({
          title: "Erro",
          description: "Título não encontrado ou já foi pago",
          variant: "destructive"
        })
        return null
      }

      // Baixar o título
      const result = baixarTitulo(tituloId, 'pagamento', 'titulosPagar')
      
      if (result) {
        // Criar despesa correspondente
        await criarDespesa({
          descricao: `Pagamento: ${titulo.descricao}`,
          valor: titulo.valor,
          categoria: 'pagamento_fornecedor',
          fornecedor: titulo.fornecedor,
          centroCusto: dadosPagamento.centroCusto || 'Geral',
          formaPagamento: dadosPagamento.formaPagamento || 'Transferência',
          contaFinanceiraId: dadosPagamento.contaFinanceiraId,
          observacoes: `Ref. título ${titulo.id}`,
          data: new Date().toISOString()
        })

        toast({
          title: "Pagamento realizado",
          description: `Título pago com sucesso: R$ ${titulo.valor.toLocaleString('pt-BR')}`
        })

        logAction('payment', 'titulosPagar', tituloId, { 
          valor: titulo.valor,
          dadosPagamento 
        })
      }

      return result
    } catch (error) {
      console.error('Erro ao pagar título:', error)
      toast({
        title: "Erro no pagamento",
        description: "Erro ao processar pagamento do título",
        variant: "destructive"
      })
      return null
    }
  }, [titulosPagarCRUD, baixarTitulo, criarDespesa, toast, logAction])

  // === TÍTULOS A RECEBER ===
  const receberTitulo = useCallback(async (tituloId, dadosRecebimento = {}) => {
    try {
      const titulo = titulosReceberCRUD.getById(tituloId)
      if (!titulo || titulo.status === 'recebido') {
        toast({
          title: "Erro",
          description: "Título não encontrado ou já foi recebido",
          variant: "destructive"
        })
        return null
      }

      // Baixar o título
      const result = baixarTitulo(tituloId, 'pagamento', 'titulosReceber')
      
      if (result) {
        // Criar receita correspondente
        await criarReceita({
          descricao: `Recebimento: ${titulo.descricao}`,
          valor: titulo.valor,
          categoria: 'vendas',
          cliente: titulo.cliente,
          formaPagamento: dadosRecebimento.formaPagamento || 'Transferência',
          contaFinanceiraId: dadosRecebimento.contaFinanceiraId,
          observacoes: `Ref. título ${titulo.id}`,
          data: new Date().toISOString()
        })

        toast({
          title: "Recebimento realizado",
          description: `Título recebido com sucesso: R$ ${titulo.valor.toLocaleString('pt-BR')}`
        })

        logAction('receipt', 'titulosReceber', tituloId, { 
          valor: titulo.valor,
          dadosRecebimento 
        })
      }

      return result
    } catch (error) {
      console.error('Erro ao receber título:', error)
      toast({
        title: "Erro no recebimento",
        description: "Erro ao processar recebimento do título",
        variant: "destructive"
      })
      return null
    }
  }, [titulosReceberCRUD, baixarTitulo, criarReceita, toast, logAction])

  // === CONCILIAÇÃO BANCÁRIA ===
  const conciliarConta = useCallback(async (contaId, movimentosBanco) => {
    try {
      const conta = contasFinanceirasCRUD.getById(contaId)
      if (!conta) return null

      // Buscar movimentações do sistema
      const receitas = receitasCRUD.getAll({ contaFinanceiraId: contaId })
      const despesas = despesasCRUD.getAll({ contaFinanceiraId: contaId })

      const movimentosSistema = [
        ...receitas.map(r => ({ 
          ...r, 
          tipo: 'entrada', 
          data: r.dataRecebimento || r.data 
        })),
        ...despesas.map(d => ({ 
          ...d, 
          tipo: 'saida', 
          data: d.dataPagamento || d.data 
        }))
      ].sort((a, b) => new Date(a.data) - new Date(b.data))

      // Lógica de conciliação (simplificada)
      const conciliacao = {
        contaId,
        dataProcessamento: new Date().toISOString(),
        saldoSistema: conta.saldo,
        saldoBanco: movimentosBanco.saldoFinal || 0,
        diferencas: [],
        status: 'conciliada'
      }

      // Verificar diferenças
      const diferenca = Math.abs(conciliacao.saldoSistema - conciliacao.saldoBanco)
      if (diferenca > 0.01) { // Tolerância de 1 centavo
        conciliacao.status = 'divergente'
        conciliacao.diferencas.push({
          tipo: 'saldo',
          valor: diferenca,
          descricao: 'Diferença entre saldo do sistema e banco'
        })
      }

      logAction('bank_reconciliation', 'contasFinanceiras', contaId, conciliacao)

      return conciliacao
    } catch (error) {
      console.error('Erro na conciliação bancária:', error)
      return null
    }
  }, [contasFinanceirasCRUD, receitasCRUD, despesasCRUD, logAction])

  // === FLUXO DE CAIXA ===
  const gerarFluxoCaixa = useCallback((dataInicio, dataFim) => {
    try {
      const inicio = new Date(dataInicio)
      const fim = new Date(dataFim)

      // Buscar receitas e despesas do período
      const receitas = receitasCRUD.getAll().filter(r => {
        const data = new Date(r.dataRecebimento || r.data)
        return data >= inicio && data <= fim
      })

      const despesas = despesasCRUD.getAll().filter(d => {
        const data = new Date(d.dataPagamento || d.data)
        return data >= inicio && data <= fim
      })

      // Buscar títulos pendentes
      const titulosPagar = titulosPagarCRUD.getAll().filter(t => 
        t.status === 'pendente' && new Date(t.dataVencimento) <= fim
      )

      const titulosReceber = titulosReceberCRUD.getAll().filter(t => 
        t.status === 'pendente' && new Date(t.dataVencimento) <= fim
      )

      // Calcular totais
      const totalReceitas = receitas.reduce((total, r) => total + r.valor, 0)
      const totalDespesas = despesas.reduce((total, d) => total + d.valor, 0)
      const totalPagar = titulosPagar.reduce((total, t) => total + t.valor, 0)
      const totalReceber = titulosReceber.reduce((total, t) => total + t.valor, 0)

      const fluxo = {
        periodo: { inicio: dataInicio, fim: dataFim },
        realizado: {
          receitas: totalReceitas,
          despesas: totalDespesas,
          resultado: totalReceitas - totalDespesas
        },
        previsto: {
          receber: totalReceber,
          pagar: totalPagar,
          resultado: totalReceber - totalPagar
        },
        consolidado: {
          entrada: totalReceitas + totalReceber,
          saida: totalDespesas + totalPagar,
          resultado: (totalReceitas + totalReceber) - (totalDespesas + totalPagar)
        }
      }

      logAction('cash_flow_generation', 'financeiro', null, fluxo)

      return fluxo
    } catch (error) {
      console.error('Erro ao gerar fluxo de caixa:', error)
      return null
    }
  }, [receitasCRUD, despesasCRUD, titulosPagarCRUD, titulosReceberCRUD, logAction])

  // === RELATÓRIOS DRE ===
  const gerarDRE = useCallback((dataInicio, dataFim) => {
    try {
      const receitas = receitasCRUD.getAll().filter(r => {
        const data = new Date(r.dataRecebimento || r.data)
        return data >= new Date(dataInicio) && data <= new Date(dataFim)
      })

      const despesas = despesasCRUD.getAll().filter(d => {
        const data = new Date(d.dataPagamento || d.data)
        return data >= new Date(dataInicio) && data <= new Date(dataFim)
      })

      // Agrupar por categoria
      const receitasPorCategoria = receitas.reduce((acc, r) => {
        acc[r.categoria] = (acc[r.categoria] || 0) + r.valor
        return acc
      }, {})

      const despesasPorCategoria = despesas.reduce((acc, d) => {
        acc[d.categoria] = (acc[d.categoria] || 0) + d.valor
        return acc
      }, {})

      const totalReceitas = Object.values(receitasPorCategoria).reduce((total, valor) => total + valor, 0)
      const totalDespesas = Object.values(despesasPorCategoria).reduce((total, valor) => total + valor, 0)

      const dre = {
        periodo: { inicio: dataInicio, fim: dataFim },
        receitas: {
          categorias: receitasPorCategoria,
          total: totalReceitas
        },
        despesas: {
          categorias: despesasPorCategoria,
          total: totalDespesas
        },
        resultado: {
          bruto: totalReceitas,
          liquido: totalReceitas - totalDespesas,
          margem: totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0
        }
      }

      logAction('dre_generation', 'financeiro', null, dre)

      return dre
    } catch (error) {
      console.error('Erro ao gerar DRE:', error)
      return null
    }
  }, [receitasCRUD, despesasCRUD, logAction])

  return {
    // Receitas
    receitas: receitasCRUD,
    criarReceita,

    // Despesas
    despesas: despesasCRUD,
    criarDespesa,

    // Contas Financeiras
    contasFinanceiras: contasFinanceirasCRUD,
    atualizarSaldoConta,

    // Títulos a Pagar
    titulosPagar: titulosPagarCRUD,
    pagarTitulo,

    // Títulos a Receber
    titulosReceber: titulosReceberCRUD,
    receberTitulo,

    // Operações Especiais
    conciliarConta,
    gerarFluxoCaixa,
    gerarDRE
  }
}
