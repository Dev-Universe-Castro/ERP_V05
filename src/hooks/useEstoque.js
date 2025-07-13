
import { useCallback } from 'react'
import { useCRUD } from './useCRUD'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/ui/use-toast'
import { useAuditLog } from './useAuditLog'

export const useEstoque = () => {
  const movimentacoesCRUD = useCRUD('movimentacoesEstoque')
  const inventariosCRUD = useCRUD('inventarios')
  const produtosCRUD = useCRUD('produtos')
  
  const { queryItems, updateItem } = useData()
  const { toast } = useToast()
  const { logAction } = useAuditLog()

  // === MOVIMENTAÇÕES ===
  const criarMovimentacao = useCallback(async (dados) => {
    try {
      const produto = produtosCRUD.getById(dados.produtoId)
      if (!produto) {
        throw new Error('Produto não encontrado')
      }

      const novaMovimentacao = {
        ...dados,
        codigo: produto.codigo,
        produto: produto.nome,
        unidade: produto.unidade,
        saldoAnterior: produto.estoqueAtual || 0,
        saldoAtual: (produto.estoqueAtual || 0) + dados.quantidade,
        valorTotal: dados.quantidade * (dados.valorUnitario || 0),
        data: dados.data || new Date().toISOString(),
        usuario: dados.usuario || 'Sistema'
      }

      const movimentacao = await movimentacoesCRUD.create(novaMovimentacao)
      
      if (movimentacao) {
        // Atualizar estoque do produto
        await atualizarEstoqueProduto(dados.produtoId, dados.quantidade)
        
        logAction('stock_movement', 'movimentacoesEstoque', movimentacao.id, {
          tipo: dados.tipo,
          quantidade: dados.quantidade,
          produto: produto.nome
        })
      }

      return movimentacao
    } catch (error) {
      console.error('Erro ao criar movimentação:', error)
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      })
      return null
    }
  }, [movimentacoesCRUD, produtosCRUD, logAction, toast])

  // === ENTRADA AUTOMÁTICA DO COMPRAS ===
  const processarRecebimentoCompra = useCallback(async (pedidoCompra) => {
    try {
      if (!pedidoCompra.itens || pedidoCompra.itens.length === 0) {
        return false
      }

      const movimentacoes = []

      for (const item of pedidoCompra.itens) {
        const movimentacao = await criarMovimentacao({
          produtoId: item.produtoId,
          tipo: 'entrada',
          subTipo: 'compra',
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          documento: pedidoCompra.numero,
          fornecedor: pedidoCompra.fornecedor,
          observacao: `Recebimento de compra - Pedido ${pedidoCompra.numero}`,
          lote: item.lote || null,
          dataValidade: item.dataValidade || null
        })

        if (movimentacao) {
          movimentacoes.push(movimentacao)
        }
      }

      if (movimentacoes.length > 0) {
        toast({
          title: "Recebimento processado",
          description: `${movimentacoes.length} itens foram adicionados ao estoque.`
        })
      }

      return movimentacoes
    } catch (error) {
      console.error('Erro ao processar recebimento:', error)
      return []
    }
  }, [criarMovimentacao, toast])

  // === SAÍDA AUTOMÁTICA DA PRODUÇÃO ===
  const processarConsumoProducao = useCallback(async (ordemProducao) => {
    try {
      if (!ordemProducao.bom || ordemProducao.bom.length === 0) {
        return false
      }

      const movimentacoes = []

      for (const componente of ordemProducao.bom) {
        const quantidadeConsumida = componente.quantidade * ordemProducao.quantidadeProduzida

        const movimentacao = await criarMovimentacao({
          produtoId: componente.materiaPrimaId,
          tipo: 'saida',
          subTipo: 'producao',
          quantidade: -quantidadeConsumida, // Negativo para saída
          valorUnitario: 0, // Custo será calculado pelo sistema
          documento: ordemProducao.numero,
          observacao: `Consumo para produção - OP ${ordemProducao.numero}`,
          centroTrabalho: ordemProducao.centroTrabalho
        })

        if (movimentacao) {
          movimentacoes.push(movimentacao)
        }
      }

      // Criar entrada do produto acabado
      if (ordemProducao.produtoId && ordemProducao.quantidadeProduzida > 0) {
        const entradaProdutoAcabado = await criarMovimentacao({
          produtoId: ordemProducao.produtoId,
          tipo: 'entrada',
          subTipo: 'producao',
          quantidade: ordemProducao.quantidadeProduzida,
          valorUnitario: ordemProducao.custoUnitario || 0,
          documento: ordemProducao.numero,
          observacao: `Produção finalizada - OP ${ordemProducao.numero}`,
          lote: ordemProducao.lote
        })

        if (entradaProdutoAcabado) {
          movimentacoes.push(entradaProdutoAcabado)
        }
      }

      if (movimentacoes.length > 0) {
        toast({
          title: "Consumo processado",
          description: `${movimentacoes.length} movimentações de produção registradas.`
        })
      }

      return movimentacoes
    } catch (error) {
      console.error('Erro ao processar consumo de produção:', error)
      return []
    }
  }, [criarMovimentacao, toast])

  // === SAÍDA MANUAL ===
  const criarSaidaManual = useCallback(async (dados) => {
    try {
      return await criarMovimentacao({
        ...dados,
        tipo: 'saida',
        subTipo: 'manual',
        quantidade: -Math.abs(dados.quantidade), // Garantir que seja negativo
        observacao: dados.motivo || 'Saída manual'
      })
    } catch (error) {
      console.error('Erro ao criar saída manual:', error)
      return null
    }
  }, [criarMovimentacao])

  // === TRANSFERÊNCIA ENTRE LOCAIS ===
  const criarTransferencia = useCallback(async (dados) => {
    try {
      const movimentacoes = []

      // Saída do local origem
      const saida = await criarMovimentacao({
        produtoId: dados.produtoId,
        tipo: 'saida',
        subTipo: 'transferencia',
        quantidade: -Math.abs(dados.quantidade),
        localEstoque: dados.localOrigem,
        documento: dados.documento || `TRANSF-${Date.now()}`,
        observacao: `Transferência para ${dados.localDestino}`,
        usuario: dados.usuario
      })

      if (saida) {
        movimentacoes.push(saida)

        // Entrada no local destino
        const entrada = await criarMovimentacao({
          produtoId: dados.produtoId,
          tipo: 'entrada',
          subTipo: 'transferencia',
          quantidade: Math.abs(dados.quantidade),
          localEstoque: dados.localDestino,
          documento: dados.documento || `TRANSF-${Date.now()}`,
          observacao: `Transferência de ${dados.localOrigem}`,
          usuario: dados.usuario
        })

        if (entrada) {
          movimentacoes.push(entrada)
        }
      }

      return movimentacoes
    } catch (error) {
      console.error('Erro ao criar transferência:', error)
      return []
    }
  }, [criarMovimentacao])

  // === INVENTÁRIO ===
  const criarInventario = useCallback(async (dados) => {
    try {
      const novoInventario = {
        ...dados,
        status: 'pendente',
        dataCriacao: new Date().toISOString()
      }

      return await inventariosCRUD.create(novoInventario)
    } catch (error) {
      console.error('Erro ao criar inventário:', error)
      return null
    }
  }, [inventariosCRUD])

  const aplicarInventario = useCallback(async (inventarioId) => {
    try {
      const inventario = inventariosCRUD.getById(inventarioId)
      if (!inventario || inventario.status !== 'pendente') {
        throw new Error('Inventário não encontrado ou já aplicado')
      }

      const movimentacoes = []

      for (const item of inventario.itens) {
        if (item.diferenca !== 0) {
          const movimentacao = await criarMovimentacao({
            produtoId: item.id,
            tipo: item.diferenca > 0 ? 'entrada' : 'saida',
            subTipo: 'ajuste',
            quantidade: item.diferenca,
            valorUnitario: 0,
            documento: `INV-${inventario.id}`,
            observacao: `Ajuste por inventário: ${inventario.descricao}`,
            usuario: inventario.responsavel
          })

          if (movimentacao) {
            movimentacoes.push(movimentacao)
          }
        }
      }

      // Atualizar status do inventário
      await inventariosCRUD.update(inventarioId, {
        status: 'aplicado',
        dataAplicacao: new Date().toISOString(),
        movimentacoesGeradas: movimentacoes.length
      })

      toast({
        title: "Inventário aplicado",
        description: `${movimentacoes.length} ajustes foram aplicados ao estoque.`
      })

      return movimentacoes
    } catch (error) {
      console.error('Erro ao aplicar inventário:', error)
      return []
    }
  }, [inventariosCRUD, criarMovimentacao, toast])

  // === UTILITÁRIOS ===
  const atualizarEstoqueProduto = useCallback(async (produtoId, quantidade) => {
    try {
      const produto = produtosCRUD.getById(produtoId)
      if (!produto) return false

      const novoEstoque = (produto.estoqueAtual || 0) + quantidade
      
      await produtosCRUD.update(produtoId, {
        estoqueAtual: Math.max(0, novoEstoque), // Não permitir estoque negativo
        dataUltimaMovimentacao: new Date().toISOString()
      })

      return true
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error)
      return false
    }
  }, [produtosCRUD])

  const verificarEstoqueBaixo = useCallback(() => {
    const produtos = produtosCRUD.getAll()
    return produtos.filter(produto => 
      produto.estoqueAtual !== undefined && 
      produto.estoqueMin !== undefined &&
      produto.estoqueAtual < produto.estoqueMin &&
      produto.ativo !== false
    )
  }, [produtosCRUD])

  const calcularValorEstoque = useCallback(() => {
    const produtos = produtosCRUD.getAll()
    return produtos.reduce((total, produto) => {
      const valorUnitario = produto.custoMedio || produto.custo || produto.preco || 0
      const quantidade = produto.estoqueAtual || 0
      return total + (valorUnitario * quantidade)
    }, 0)
  }, [produtosCRUD])

  const getMovimentacoesPorPeriodo = useCallback((dataInicio, dataFim, filtros = {}) => {
    const movimentacoes = movimentacoesCRUD.getAll()
    
    return movimentacoes.filter(mov => {
      const dataMovimentacao = new Date(mov.data)
      const dentroPeríodo = dataMovimentacao >= new Date(dataInicio) && 
                           dataMovimentacao <= new Date(dataFim)
      
      if (!dentroPeríodo) return false

      // Aplicar filtros adicionais
      if (filtros.tipo && mov.tipo !== filtros.tipo) return false
      if (filtros.produtoId && mov.produtoId !== filtros.produtoId) return false
      if (filtros.localEstoque && mov.localEstoque !== filtros.localEstoque) return false

      return true
    })
  }, [movimentacoesCRUD])

  const getEstatisticas = useCallback(() => {
    const produtos = produtosCRUD.getAll()
    const movimentacoes = movimentacoesCRUD.getAll()
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    const movimentacoesMes = movimentacoes.filter(mov => 
      new Date(mov.data) >= inicioMes
    )

    return {
      totalProdutos: produtos.length,
      produtosAtivos: produtos.filter(p => p.ativo !== false).length,
      produtosEstoqueBaixo: verificarEstoqueBaixo().length,
      valorTotalEstoque: calcularValorEstoque(),
      movimentacoesMes: movimentacoesMes.length,
      entradasMes: movimentacoesMes.filter(m => m.tipo === 'entrada').length,
      saidasMes: movimentacoesMes.filter(m => m.tipo === 'saida').length,
      ultimaMovimentacao: movimentacoes.length > 0 ? 
        movimentacoes.sort((a, b) => new Date(b.data) - new Date(a.data))[0] : null
    }
  }, [produtosCRUD, movimentacoesCRUD, verificarEstoqueBaixo, calcularValorEstoque])

  return {
    // CRUD básico
    movimentacoes: movimentacoesCRUD,
    inventarios: inventariosCRUD,
    produtos: produtosCRUD,

    // Operações principais
    criarMovimentacao,
    criarSaidaManual,
    criarTransferencia,
    criarInventario,
    aplicarInventario,

    // Integrações
    processarRecebimentoCompra,
    processarConsumoProducao,

    // Utilitários
    atualizarEstoqueProduto,
    verificarEstoqueBaixo,
    calcularValorEstoque,
    getMovimentacoesPorPeriodo,
    getEstatisticas
  }
}
