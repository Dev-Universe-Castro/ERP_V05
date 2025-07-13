
import { useCallback } from 'react'
import { useCRUD } from './useCRUD'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/ui/use-toast'
import { useAuditLog } from './useAuditLog'

export const useCompras = () => {
  const requisicoesCRUD = useCRUD('requisicoes')
  const cotacoesCRUD = useCRUD('cotacoes')
  const pedidosCRUD = useCRUD('pedidosCompra')
  const aprovacoesCRUD = useCRUD('pendentesAprovacao')
  
  const { generateNumber, queryItems, createTitulosPagar } = useData()
  const { toast } = useToast()
  const { logAction } = useAuditLog()

  // === REQUISIÇÕES ===
  const criarRequisicao = useCallback(async (dados) => {
    try {
      const numeroRequisicao = generateNumber('REQ', 'requisicoes')
      
      const novaRequisicao = {
        ...dados,
        numero: numeroRequisicao,
        status: 'pendente',
        valorTotal: dados.itens?.reduce((total, item) => 
          total + (item.quantidade * item.precoEstimado), 0) || 0
      }

      const requisicao = await requisicoesCRUD.create(novaRequisicao)
      
      if (requisicao) {
        // Criar aprovação automática se valor for alto
        if (requisicao.valorTotal > 1000) {
          await criarAprovacao({
            tipo: 'requisicao',
            documento: requisicao.numero,
            valor: requisicao.valorTotal,
            solicitante: requisicao.solicitante,
            aprovador: 'Gerente Compras',
            status: 'pendente',
            nivel: 1,
            dataLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            justificativa: dados.observacoes || 'Aprovação necessária por valor alto'
          })
        }
      }

      return requisicao
    } catch (error) {
      console.error('Erro ao criar requisição:', error)
      return null
    }
  }, [requisicoesCRUD, generateNumber])

  const aprovarRequisicao = useCallback(async (id, observacoes = '') => {
    const requisicao = await requisicoesCRUD.update(id, {
      status: 'aprovada',
      dataAprovacao: new Date().toISOString(),
      observacoesAprovacao: observacoes
    })

    if (requisicao) {
      logAction('approve', 'requisicoes', id, { observacoes })
    }

    return requisicao
  }, [requisicoesCRUD, logAction])

  const rejeitarRequisicao = useCallback(async (id, motivo = '') => {
    const requisicao = await requisicoesCRUD.update(id, {
      status: 'rejeitada',
      dataRejeicao: new Date().toISOString(),
      motivoRejeicao: motivo
    })

    if (requisicao) {
      logAction('reject', 'requisicoes', id, { motivo })
    }

    return requisicao
  }, [requisicoesCRUD, logAction])

  // === COTAÇÕES ===
  const criarCotacao = useCallback(async (dados) => {
    try {
      const numeroCotacao = generateNumber('COT', 'cotacoes')
      
      const novaCotacao = {
        ...dados,
        numero: numeroCotacao,
        status: 'em_analise',
        melhorOferta: 0 // Índice da melhor oferta
      }

      return await cotacoesCRUD.create(novaCotacao)
    } catch (error) {
      console.error('Erro ao criar cotação:', error)
      return null
    }
  }, [cotacoesCRUD, generateNumber])

  const selecionarMelhorOferta = useCallback(async (cotacaoId, indiceFornecedor) => {
    const cotacao = await cotacoesCRUD.update(cotacaoId, {
      melhorOferta: indiceFornecedor,
      status: 'finalizada',
      dataFinalizacao: new Date().toISOString()
    })

    if (cotacao) {
      logAction('select_best_offer', 'cotacoes', cotacaoId, { 
        fornecedorSelecionado: cotacao.fornecedores[indiceFornecedor] 
      })
    }

    return cotacao
  }, [cotacoesCRUD, logAction])

  // === PEDIDOS DE COMPRA ===
  const criarPedidoCompra = useCallback(async (dados) => {
    try {
      const numeroPedido = generateNumber('PED', 'pedidosCompra')
      
      const novoPedido = {
        ...dados,
        numero: numeroPedido,
        status: 'rascunho',
        valorTotal: dados.itens?.reduce((total, item) => 
          total + (item.quantidade * item.valorUnitario), 0) || 0,
        dataEmissao: new Date().toISOString()
      }

      return await pedidosCRUD.create(novoPedido)
    } catch (error) {
      console.error('Erro ao criar pedido de compra:', error)
      return null
    }
  }, [pedidosCRUD, generateNumber])

  const enviarPedidoCompra = useCallback(async (id) => {
    const pedido = await pedidosCRUD.update(id, {
      status: 'enviado',
      dataEnvio: new Date().toISOString()
    })

    if (pedido) {
      // Buscar dados do fornecedor para criar títulos a pagar
      const fornecedores = queryItems('fornecedores')
      const fornecedor = fornecedores.find(f => f.nome === pedido.fornecedor)
      
      if (fornecedor) {
        createTitulosPagar(pedido, fornecedor)
      }

      logAction('send', 'pedidosCompra', id)
    }

    return pedido
  }, [pedidosCRUD, queryItems, createTitulosPagar, logAction])

  const receberPedidoCompra = useCallback(async (id, dadosRecebimento = {}) => {
    const pedido = await pedidosCRUD.update(id, {
      status: 'recebido',
      dataRecebimento: new Date().toISOString(),
      ...dadosRecebimento
    })

    if (pedido) {
      // Processar entrada no estoque automaticamente
      try {
        const { useEstoque } = await import('./useEstoque')
        const estoque = useEstoque()
        await estoque.processarRecebimentoCompra(pedido)
      } catch (error) {
        console.error('Erro ao processar entrada no estoque:', error)
      }

      logAction('receive', 'pedidosCompra', id, dadosRecebimento)
    }

    return pedido
  }, [pedidosCRUD, logAction])

  const confirmarPedidoCompra = useCallback(async (id, dataEntregaPrevista) => {
    const pedido = await pedidosCRUD.update(id, {
      status: 'confirmado',
      dataConfirmacao: new Date().toISOString(),
      dataEntregaPrevista
    })

    if (pedido) {
      logAction('confirm', 'pedidosCompra', id, { dataEntregaPrevista })
    }

    return pedido
  }, [pedidosCRUD, logAction])

  // === APROVAÇÕES ===
  const criarAprovacao = useCallback(async (dados) => {
    return await aprovacoesCRUD.create(dados)
  }, [aprovacoesCRUD])

  const processarAprovacao = useCallback(async (id, acao, observacoes = '') => {
    const aprovacao = await aprovacoesCRUD.update(id, {
      status: acao, // 'aprovada' ou 'rejeitada'
      dataProcessamento: new Date().toISOString(),
      observacoesAprovacao: observacoes
    })

    if (aprovacao) {
      logAction('process_approval', 'pendentesAprovacao', id, { acao, observacoes })
      
      // Se for aprovação de requisição, atualizar status da requisição
      if (aprovacao.tipo === 'requisicao' && acao === 'aprovada') {
        const requisicoes = queryItems('requisicoes', { numero: aprovacao.documento })
        if (requisicoes.length > 0) {
          await aprovarRequisicao(requisicoes[0].id, observacoes)
        }
      }
    }

    return aprovacao
  }, [aprovacoesCRUD, queryItems, aprovarRequisicao, logAction])

  // === RELATÓRIOS E ESTATÍSTICAS ===
  const getEstatisticas = useCallback(() => {
    const requisicoes = requisicoesCRUD.getAll()
    const cotacoes = cotacoesCRUD.getAll()
    const pedidos = pedidosCRUD.getAll()
    const aprovacoes = aprovacoesCRUD.getAll()

    return {
      requisicoes: {
        total: requisicoes.length,
        pendentes: requisicoes.filter(r => r.status === 'pendente').length,
        aprovadas: requisicoes.filter(r => r.status === 'aprovada').length,
        rejeitadas: requisicoes.filter(r => r.status === 'rejeitada').length
      },
      cotacoes: {
        total: cotacoes.length,
        emAnalise: cotacoes.filter(c => c.status === 'em_analise').length,
        finalizadas: cotacoes.filter(c => c.status === 'finalizada').length
      },
      pedidos: {
        total: pedidos.length,
        rascunhos: pedidos.filter(p => p.status === 'rascunho').length,
        enviados: pedidos.filter(p => p.status === 'enviado').length,
        confirmados: pedidos.filter(p => p.status === 'confirmado').length,
        valorTotal: pedidos.reduce((total, p) => total + (p.valorTotal || 0), 0)
      },
      aprovacoes: {
        total: aprovacoes.length,
        pendentes: aprovacoes.filter(a => a.status === 'pendente').length,
        vencidas: aprovacoes.filter(a => 
          a.status === 'pendente' && new Date(a.dataLimite) < new Date()
        ).length
      }
    }
  }, [requisicoesCRUD, cotacoesCRUD, pedidosCRUD, aprovacoesCRUD])

  const buscarPorPeriodo = useCallback((dataInicio, dataFim, tipo = 'requisicoes') => {
    const crud = {
      requisicoes: requisicoesCRUD,
      cotacoes: cotacoesCRUD,
      pedidos: pedidosCRUD,
      aprovacoes: aprovacoesCRUD
    }[tipo]

    if (!crud) return []

    const items = crud.getAll()
    return items.filter(item => {
      const dataItem = new Date(item.createdAt || item.dataEmissao)
      return dataItem >= new Date(dataInicio) && dataItem <= new Date(dataFim)
    })
  }, [requisicoesCRUD, cotacoesCRUD, pedidosCRUD, aprovacoesCRUD])

  return {
    // Requisições
    requisicoes: requisicoesCRUD,
    criarRequisicao,
    aprovarRequisicao,
    rejeitarRequisicao,

    // Cotações
    cotacoes: cotacoesCRUD,
    criarCotacao,
    selecionarMelhorOferta,

    // Pedidos de Compra
    pedidos: pedidosCRUD,
    criarPedidoCompra,
    enviarPedidoCompra,
    receberPedidoCompra,
    confirmarPedidoCompra,

    // Aprovações
    aprovacoes: aprovacoesCRUD,
    criarAprovacao,
    processarAprovacao,

    // Relatórios
    getEstatisticas,
    buscarPorPeriodo
  }
}
