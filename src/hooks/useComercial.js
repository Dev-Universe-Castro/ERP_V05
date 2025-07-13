
import { useCallback } from 'react'
import { useCRUD } from './useCRUD'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/ui/use-toast'
import { useAuditLog } from './useAuditLog'

export const useComercial = () => {
  const pedidosVendaCRUD = useCRUD('pedidosVenda')
  const propostasCRUD = useCRUD('propostas')
  const comissoesCRUD = useCRUD('comissoes')
  const vendedoresCRUD = useCRUD('vendedores')
  const faturamentosCRUD = useCRUD('faturamentos')
  const embarquesCRUD = useCRUD('embarques')
  
  const { queryItems, generateNumber, findById, insertItem } = useData()
  const { toast } = useToast()
  const { logAction } = useAuditLog()

  // === PEDIDOS DE VENDA ===
  const criarPedidoVenda = useCallback(async (dados) => {
    try {
      const numeroPedido = generateNumber('PV', 'pedidosVenda')
      
      const novoPedido = {
        ...dados,
        numeroPedido,
        status: 'orcamento',
        dataEmissao: new Date().toISOString(),
        valorTotalProdutos: dados.itens?.reduce((total, item) => total + (item.valorTotal || 0), 0) || 0,
        valorDesconto: dados.desconto || 0,
        valorFrete: dados.frete || 0,
        valorImposto: dados.imposto || 0,
        valorTotal: 0,
        prazoEntrega: dados.prazoEntrega || 30,
        condicoesPagamento: dados.condicoesPagamento || '30 dias',
        observacoes: dados.observacoes || ''
      }

      // Calcular valor total
      novoPedido.valorTotal = novoPedido.valorTotalProdutos + 
                             (novoPedido.valorFrete || 0) + 
                             (novoPedido.valorImposto || 0) - 
                             (novoPedido.valorDesconto || 0)

      const pedido = await pedidosVendaCRUD.create(novoPedido)
      
      if (pedido) {
        logAction('create', 'pedidosVenda', pedido.id, {
          numero: numeroPedido,
          cliente: dados.cliente,
          valor: novoPedido.valorTotal
        })

        toast({
          title: "Pedido criado",
          description: `Pedido ${numeroPedido} criado com sucesso.`
        })
      }

      return pedido
    } catch (error) {
      console.error('Erro ao criar pedido de venda:', error)
      toast({
        title: "Erro",
        description: "Erro ao criar pedido de venda",
        variant: "destructive"
      })
      return null
    }
  }, [pedidosVendaCRUD, generateNumber, logAction, toast])

  const atualizarStatusPedido = useCallback(async (id, novoStatus) => {
    try {
      const pedido = await pedidosVendaCRUD.update(id, {
        status: novoStatus,
        [`data${novoStatus.charAt(0).toUpperCase() + novoStatus.slice(1)}`]: new Date().toISOString()
      })

      if (pedido) {
        logAction('update_status', 'pedidosVenda', id, { novoStatus })

        // Se aprovado, criar no financeiro
        if (novoStatus === 'aprovado') {
          await criarTituloReceber(pedido)
        }

        toast({
          title: "Status atualizado",
          description: `Pedido ${pedido.numeroPedido} agora está ${novoStatus}.`
        })
      }

      return pedido
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error)
      return null
    }
  }, [pedidosVendaCRUD, logAction, toast])

  const criarTituloReceber = useCallback(async (pedido) => {
    try {
      const tituloReceber = {
        descricao: `Venda ${pedido.numeroPedido} - ${pedido.cliente}`,
        origem: "Pedido de Venda",
        pedidoVendaId: pedido.id,
        cliente: pedido.cliente,
        clienteId: pedido.clienteId,
        valor: pedido.valorTotal,
        dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        dataEmissao: new Date().toISOString(),
        status: "pendente",
        observacoes: `Receita referente ao pedido ${pedido.numeroPedido}`,
      }

      return insertItem('titulosReceber', tituloReceber)
    } catch (error) {
      console.error('Erro ao criar título a receber:', error)
      return null
    }
  }, [insertItem])

  // === PROPOSTAS ===
  const criarProposta = useCallback(async (dados) => {
    try {
      const numeroProposta = generateNumber('PROP', 'propostas')
      
      const novaProposta = {
        ...dados,
        numeroProposta,
        status: 'elaboracao',
        dataEmissao: new Date().toISOString(),
        dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        valorTotal: dados.itens?.reduce((total, item) => total + (item.valorTotal || 0), 0) || 0,
        margem: dados.margem || 0,
        probabilidade: dados.probabilidade || 50
      }

      const proposta = await propostasCRUD.create(novaProposta)
      
      if (proposta) {
        logAction('create', 'propostas', proposta.id, {
          numero: numeroProposta,
          cliente: dados.cliente
        })
      }

      return proposta
    } catch (error) {
      console.error('Erro ao criar proposta:', error)
      return null
    }
  }, [propostasCRUD, generateNumber, logAction])

  const converterPropostaEmPedido = useCallback(async (propostaId) => {
    try {
      const proposta = pedidosVendaCRUD.getById(propostaId)
      if (!proposta) return null

      const dadosPedido = {
        cliente: proposta.cliente,
        clienteId: proposta.clienteId,
        vendedor: proposta.vendedor,
        vendedorId: proposta.vendedorId,
        itens: proposta.itens,
        desconto: proposta.desconto,
        frete: proposta.frete,
        imposto: proposta.imposto,
        condicoesPagamento: proposta.condicoesPagamento,
        prazoEntrega: proposta.prazoEntrega,
        observacoes: `Convertido da proposta ${proposta.numeroProposta}`,
        propostaId: propostaId
      }

      const pedido = await criarPedidoVenda(dadosPedido)

      if (pedido) {
        await propostasCRUD.update(propostaId, {
          status: 'convertida',
          dataConversao: new Date().toISOString(),
          pedidoVendaId: pedido.id
        })
      }

      return pedido
    } catch (error) {
      console.error('Erro ao converter proposta em pedido:', error)
      return null
    }
  }, [propostasCRUD, criarPedidoVenda])

  // === FATURAMENTO ===
  const criarFaturamento = useCallback(async (pedidoId, dados) => {
    try {
      const pedido = pedidosVendaCRUD.getById(pedidoId)
      if (!pedido) return null

      const numeroNF = generateNumber('NF', 'faturamentos')
      
      const novoFaturamento = {
        ...dados,
        numeroNF,
        pedidoVendaId: pedidoId,
        numeroPedido: pedido.numeroPedido,
        cliente: pedido.cliente,
        clienteId: pedido.clienteId,
        dataEmissao: new Date().toISOString(),
        valorNF: dados.valorNF || pedido.valorTotal,
        status: 'emitida',
        chaveAcesso: dados.chaveAcesso || '',
        xmlNF: dados.xmlNF || ''
      }

      const faturamento = await faturamentosCRUD.create(novoFaturamento)
      
      if (faturamento) {
        // Atualizar status do pedido
        await pedidosVendaCRUD.update(pedidoId, {
          status: 'faturado',
          dataFaturamento: new Date().toISOString(),
          numeroNF: numeroNF
        })

        logAction('create', 'faturamentos', faturamento.id, {
          numero: numeroNF,
          pedido: pedido.numeroPedido
        })

        toast({
          title: "Faturamento criado",
          description: `NF ${numeroNF} emitida com sucesso.`
        })
      }

      return faturamento
    } catch (error) {
      console.error('Erro ao criar faturamento:', error)
      return null
    }
  }, [faturamentosCRUD, pedidosVendaCRUD, generateNumber, logAction, toast])

  // === EMBARQUES ===
  const criarEmbarque = useCallback(async (faturamentoId, dados) => {
    try {
      const faturamento = faturamentosCRUD.getById(faturamentoId)
      if (!faturamento) return null

      const numeroEmbarque = generateNumber('EMB', 'embarques')
      
      const novoEmbarque = {
        ...dados,
        numeroEmbarque,
        faturamentoId,
        numeroNF: faturamento.numeroNF,
        cliente: faturamento.cliente,
        dataEmbarque: new Date().toISOString(),
        status: 'preparacao',
        transportadora: dados.transportadora || '',
        veiculo: dados.veiculo || '',
        motorista: dados.motorista || '',
        observacoes: dados.observacoes || ''
      }

      const embarque = await embarquesCRUD.create(novoEmbarque)
      
      if (embarque) {
        // Atualizar status do faturamento
        await faturamentosCRUD.update(faturamentoId, {
          status: 'embarcada',
          dataEmbarque: new Date().toISOString(),
          numeroEmbarque: numeroEmbarque
        })

        logAction('create', 'embarques', embarque.id, {
          numero: numeroEmbarque,
          nf: faturamento.numeroNF
        })
      }

      return embarque
    } catch (error) {
      console.error('Erro ao criar embarque:', error)
      return null
    }
  }, [embarquesCRUD, faturamentosCRUD, generateNumber, logAction])

  // === COMISSÕES ===
  const calcularComissao = useCallback(async (pedidoId) => {
    try {
      const pedido = pedidosVendaCRUD.getById(pedidoId)
      if (!pedido || !pedido.vendedorId) return null

      const vendedor = vendedoresCRUD.getById(pedido.vendedorId)
      if (!vendedor) return null

      const percentualComissao = vendedor.percentualComissao || 3
      const valorComissao = (pedido.valorTotal * percentualComissao) / 100

      const comissao = {
        pedidoVendaId: pedidoId,
        vendedorId: pedido.vendedorId,
        vendedor: vendedor.nome,
        numeroPedido: pedido.numeroPedido,
        cliente: pedido.cliente,
        valorVenda: pedido.valorTotal,
        percentualComissao,
        valorComissao,
        dataVenda: pedido.dataEmissao,
        mesReferencia: new Date().toISOString().slice(0, 7), // YYYY-MM
        status: 'calculada',
        observacoes: `Comissão calculada automaticamente`
      }

      return await comissoesCRUD.create(comissao)
    } catch (error) {
      console.error('Erro ao calcular comissão:', error)
      return null
    }
  }, [pedidosVendaCRUD, vendedoresCRUD, comissoesCRUD])

  // === RELATÓRIOS E ESTATÍSTICAS ===
  const getEstatisticas = useCallback(() => {
    const pedidos = pedidosVendaCRUD.getAll()
    const propostas = propostasCRUD.getAll()
    const faturamentos = faturamentosCRUD.getAll()
    const comissoes = comissoesCRUD.getAll()

    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    const pedidosMes = pedidos.filter(p => new Date(p.dataEmissao) >= inicioMes)
    const faturamentosMes = faturamentos.filter(f => new Date(f.dataEmissao) >= inicioMes)

    const vendasPorStatus = pedidos.reduce((acc, pedido) => {
      acc[pedido.status] = (acc[pedido.status] || 0) + 1
      return acc
    }, {})

    const valorTotalVendasMes = pedidosMes.reduce((total, p) => total + (p.valorTotal || 0), 0)
    const valorTotalFaturamentoMes = faturamentosMes.reduce((total, f) => total + (f.valorNF || 0), 0)

    return {
      pedidos: {
        total: pedidos.length,
        mes: pedidosMes.length,
        orcamentos: vendasPorStatus.orcamento || 0,
        aprovados: vendasPorStatus.aprovado || 0,
        faturados: vendasPorStatus.faturado || 0,
        entregues: vendasPorStatus.entregue || 0
      },
      propostas: {
        total: propostas.length,
        elaboracao: propostas.filter(p => p.status === 'elaboracao').length,
        enviadas: propostas.filter(p => p.status === 'enviada').length,
        aprovadas: propostas.filter(p => p.status === 'aprovada').length,
        convertidas: propostas.filter(p => p.status === 'convertida').length
      },
      faturamento: {
        total: faturamentos.length,
        mes: faturamentosMes.length,
        valorMes: valorTotalFaturamentoMes
      },
      vendas: {
        valorMes: valorTotalVendasMes,
        ticketMedio: pedidosMes.length > 0 ? valorTotalVendasMes / pedidosMes.length : 0
      },
      comissoes: {
        total: comissoes.length,
        valorTotal: comissoes.reduce((total, c) => total + (c.valorComissao || 0), 0)
      }
    }
  }, [pedidosVendaCRUD, propostasCRUD, faturamentosCRUD, comissoesCRUD])

  const getIndicadores = useCallback(() => {
    const pedidos = pedidosVendaCRUD.getAll()
    const propostas = propostasCRUD.getAll()
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    const pedidosMes = pedidos.filter(p => new Date(p.dataEmissao) >= inicioMes)
    const propostasMes = propostas.filter(p => new Date(p.dataEmissao) >= inicioMes)

    const taxaConversao = propostasMes.length > 0 ? 
      (propostasMes.filter(p => p.status === 'convertida').length / propostasMes.length) * 100 : 0

    const tempoMedioVenda = pedidos.filter(p => p.dataAprovacao && p.dataEmissao).reduce((total, pedido) => {
      const dias = Math.floor((new Date(p.dataAprovacao) - new Date(p.dataEmissao)) / (1000 * 60 * 60 * 24))
      return total + dias
    }, 0) / (pedidos.filter(p => p.dataAprovacao).length || 1)

    const metaMensal = 100000 // Meta exemplo
    const realizadoMes = pedidosMes.reduce((total, p) => total + (p.valorTotal || 0), 0)
    const atingimentoMeta = (realizadoMes / metaMensal) * 100

    return {
      taxaConversao,
      tempoMedioVenda,
      atingimentoMeta,
      realizadoMes,
      metaMensal,
      pedidosNoPrazo: pedidos.filter(p => p.dataEntrega && p.prazoEntrega && 
        new Date(p.dataEntrega) <= new Date(p.dataEmissao).getTime() + p.prazoEntrega * 24 * 60 * 60 * 1000
      ).length
    }
  }, [pedidosVendaCRUD, propostasCRUD])

  return {
    // CRUD básico
    pedidosVenda: pedidosVendaCRUD,
    propostas: propostasCRUD,
    comissoes: comissoesCRUD,
    vendedores: vendedoresCRUD,
    faturamentos: faturamentosCRUD,
    embarques: embarquesCRUD,

    // Operações de pedidos
    criarPedidoVenda,
    atualizarStatusPedido,

    // Operações de propostas
    criarProposta,
    converterPropostaEmPedido,

    // Operações de faturamento
    criarFaturamento,

    // Operações de embarque
    criarEmbarque,

    // Operações de comissão
    calcularComissao,

    // Relatórios e estatísticas
    getEstatisticas,
    getIndicadores
  }
}
