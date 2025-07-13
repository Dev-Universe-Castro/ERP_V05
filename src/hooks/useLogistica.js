
import { useCallback } from 'react'
import { useCRUD } from './useCRUD'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/ui/use-toast'
import { useAuditLog } from './useAuditLog'

export const useLogistica = () => {
  const romaneiosCRUD = useCRUD('romaneios')
  const entregasCRUD = useCRUD('entregas')
  const rotasCRUD = useCRUD('rotas')
  const expedicoesCRUD = useCRUD('expedicoes')
  const veiculosCRUD = useCRUD('veiculos')
  const motoristasCRUD = useCRUD('motoristas')
  
  const { queryItems, generateNumber } = useData()
  const { toast } = useToast()
  const { logAction } = useAuditLog()

  // === ROMANEIOS ===
  const criarRomaneio = useCallback(async (dados) => {
    try {
      const numeroRomaneio = generateNumber('ROM', 'romaneios')
      
      const novoRomaneio = {
        ...dados,
        numero: numeroRomaneio,
        status: 'preparacao',
        dataEmissao: new Date().toISOString(),
        valorTotal: dados.itens?.reduce((total, item) => total + (item.valor || 0), 0) || 0,
        pesoTotal: dados.itens?.reduce((total, item) => total + (item.peso || 0), 0) || 0,
        volumeTotal: dados.itens?.reduce((total, item) => total + (item.volume || 0), 0) || 0,
        observacoes: dados.observacoes || ''
      }

      const romaneio = await romaneiosCRUD.create(novoRomaneio)
      
      if (romaneio) {
        // Criar entregas automaticamente para cada item
        for (const item of dados.itens || []) {
          await criarEntrega({
            romaneioId: romaneio.id,
            numeroRomaneio: numeroRomaneio,
            cliente: item.cliente,
            clienteId: item.clienteId,
            endereco: item.endereco,
            produto: item.produto,
            quantidade: item.quantidade,
            valor: item.valor,
            peso: item.peso,
            volume: item.volume,
            observacoes: item.observacoes,
            dataPrevisao: dados.dataPrevisao
          })
        }

        logAction('create', 'romaneios', romaneio.id, {
          numero: numeroRomaneio,
          itens: dados.itens?.length || 0
        })
      }

      return romaneio
    } catch (error) {
      console.error('Erro ao criar romaneio:', error)
      toast({
        title: "Erro",
        description: "Erro ao criar romaneio",
        variant: "destructive"
      })
      return null
    }
  }, [romaneiosCRUD, generateNumber, logAction, toast])

  const atualizarStatusRomaneio = useCallback(async (id, novoStatus) => {
    try {
      const romaneio = await romaneiosCRUD.update(id, {
        status: novoStatus,
        [`data${novoStatus.charAt(0).toUpperCase() + novoStatus.slice(1)}`]: new Date().toISOString()
      })

      if (romaneio) {
        // Atualizar status das entregas relacionadas
        const entregas = queryItems('entregas', { romaneioId: id })
        for (const entrega of entregas) {
          await entregasCRUD.update(entrega.id, { status: novoStatus })
        }

        logAction('update_status', 'romaneios', id, { novoStatus })
      }

      return romaneio
    } catch (error) {
      console.error('Erro ao atualizar status do romaneio:', error)
      return null
    }
  }, [romaneiosCRUD, entregasCRUD, queryItems, logAction])

  // === ENTREGAS ===
  const criarEntrega = useCallback(async (dados) => {
    try {
      const numeroEntrega = generateNumber('ENT', 'entregas')
      
      const novaEntrega = {
        ...dados,
        numero: numeroEntrega,
        status: 'preparacao',
        dataEmissao: new Date().toISOString(),
        tentativas: 0,
        historico: []
      }

      const entrega = await entregasCRUD.create(novaEntrega)
      
      if (entrega) {
        logAction('create', 'entregas', entrega.id, {
          numero: numeroEntrega,
          cliente: dados.cliente
        })
      }

      return entrega
    } catch (error) {
      console.error('Erro ao criar entrega:', error)
      return null
    }
  }, [entregasCRUD, generateNumber, logAction])

  const atualizarStatusEntrega = useCallback(async (id, novoStatus, observacoes = '') => {
    try {
      const entrega = entregasCRUD.getById(id)
      if (!entrega) return null

      const novoHistorico = [
        ...entrega.historico,
        {
          status: novoStatus,
          data: new Date().toISOString(),
          observacoes,
          usuario: 'Sistema' // TODO: Pegar do contexto de auth
        }
      ]

      const entregaAtualizada = await entregasCRUD.update(id, {
        status: novoStatus,
        historico: novoHistorico,
        [`data${novoStatus.charAt(0).toUpperCase() + novoStatus.slice(1)}`]: new Date().toISOString(),
        observacoes: observacoes || entrega.observacoes
      })

      if (entregaAtualizada) {
        logAction('update_status', 'entregas', id, { novoStatus, observacoes })
      }

      return entregaAtualizada
    } catch (error) {
      console.error('Erro ao atualizar status da entrega:', error)
      return null
    }
  }, [entregasCRUD, logAction])

  const confirmarEntrega = useCallback(async (id, dadosConfirmacao) => {
    try {
      const entrega = await entregasCRUD.update(id, {
        status: 'entregue',
        dataEntrega: new Date().toISOString(),
        recebedor: dadosConfirmacao.recebedor,
        documentoRecebedor: dadosConfirmacao.documentoRecebedor,
        observacoesEntrega: dadosConfirmacao.observacoes,
        fotoComprovante: dadosConfirmacao.fotoComprovante
      })

      if (entrega) {
        logAction('confirm_delivery', 'entregas', id, dadosConfirmacao)
        
        toast({
          title: "Entrega confirmada",
          description: `Entrega ${entrega.numero} confirmada com sucesso.`
        })
      }

      return entrega
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error)
      return null
    }
  }, [entregasCRUD, logAction, toast])

  // === ROTAS ===
  const criarRota = useCallback(async (dados) => {
    try {
      const numeroRota = generateNumber('ROT', 'rotas')
      
      const novaRota = {
        ...dados,
        numero: numeroRota,
        status: 'planejada',
        dataEmissao: new Date().toISOString(),
        distanciaTotal: dados.paradas?.reduce((total, parada, index) => {
          if (index === 0) return total
          return total + (parada.distancia || 0)
        }, 0) || 0,
        tempoEstimado: dados.paradas?.reduce((total, parada) => total + (parada.tempo || 0), 0) || 0
      }

      const rota = await rotasCRUD.create(novaRota)
      
      if (rota) {
        logAction('create', 'rotas', rota.id, {
          numero: numeroRota,
          paradas: dados.paradas?.length || 0
        })
      }

      return rota
    } catch (error) {
      console.error('Erro ao criar rota:', error)
      return null
    }
  }, [rotasCRUD, generateNumber, logAction])

  const otimizarRota = useCallback(async (rotaId) => {
    try {
      const rota = rotasCRUD.getById(rotaId)
      if (!rota || !rota.paradas) return null

      // Algoritmo simples de otimização (pode ser melhorado)
      const paradasOtimizadas = [...rota.paradas].sort((a, b) => {
        // Ordenar por prioridade e depois por distância
        if (a.prioridade !== b.prioridade) {
          return a.prioridade - b.prioridade
        }
        return (a.distancia || 0) - (b.distancia || 0)
      })

      const rotaOtimizada = await rotasCRUD.update(rotaId, {
        paradas: paradasOtimizadas,
        status: 'otimizada',
        dataOtimizacao: new Date().toISOString()
      })

      if (rotaOtimizada) {
        logAction('optimize', 'rotas', rotaId)
        
        toast({
          title: "Rota otimizada",
          description: "Rota otimizada com sucesso."
        })
      }

      return rotaOtimizada
    } catch (error) {
      console.error('Erro ao otimizar rota:', error)
      return null
    }
  }, [rotasCRUD, logAction, toast])

  // === EXPEDIÇÃO ===
  const criarExpedicao = useCallback(async (dados) => {
    try {
      const numeroExpedicao = generateNumber('EXP', 'expedicoes')
      
      const novaExpedicao = {
        ...dados,
        numero: numeroExpedicao,
        status: 'preparacao',
        dataEmissao: new Date().toISOString(),
        itensTotal: dados.itens?.length || 0,
        pesoTotal: dados.itens?.reduce((total, item) => total + (item.peso || 0), 0) || 0
      }

      const expedicao = await expedicoesCRUD.create(novaExpedicao)
      
      if (expedicao) {
        logAction('create', 'expedicoes', expedicao.id, {
          numero: numeroExpedicao,
          itens: dados.itens?.length || 0
        })
      }

      return expedicao
    } catch (error) {
      console.error('Erro ao criar expedição:', error)
      return null
    }
  }, [expedicoesCRUD, generateNumber, logAction])

  const separarItens = useCallback(async (expedicaoId, itensParaSeparar) => {
    try {
      const expedicao = expedicoesCRUD.getById(expedicaoId)
      if (!expedicao) return null

      const itensSeparados = expedicao.itens?.map(item => {
        const itemSeparacao = itensParaSeparar.find(i => i.id === item.id)
        if (itemSeparacao) {
          return {
            ...item,
            status: 'separado',
            quantidadeSeparada: itemSeparacao.quantidade,
            dataSeparacao: new Date().toISOString(),
            responsavelSeparacao: itemSeparacao.responsavel
          }
        }
        return item
      })

      const expedicaoAtualizada = await expedicoesCRUD.update(expedicaoId, {
        itens: itensSeparados,
        status: 'separacao',
        dataSeparacao: new Date().toISOString()
      })

      if (expedicaoAtualizada) {
        logAction('separate_items', 'expedicoes', expedicaoId, { itens: itensParaSeparar.length })
      }

      return expedicaoAtualizada
    } catch (error) {
      console.error('Erro ao separar itens:', error)
      return null
    }
  }, [expedicoesCRUD, logAction])

  const embarcarItens = useCallback(async (expedicaoId, dadosEmbarque) => {
    try {
      const expedicao = await expedicoesCRUD.update(expedicaoId, {
        status: 'embarcado',
        dataEmbarque: new Date().toISOString(),
        veiculoId: dadosEmbarque.veiculoId,
        motoristaId: dadosEmbarque.motoristaId,
        observacoesEmbarque: dadosEmbarque.observacoes
      })

      if (expedicao) {
        logAction('embark_items', 'expedicoes', expedicaoId, dadosEmbarque)
        
        toast({
          title: "Embarque realizado",
          description: "Itens embarcados com sucesso."
        })
      }

      return expedicao
    } catch (error) {
      console.error('Erro ao embarcar itens:', error)
      return null
    }
  }, [expedicoesCRUD, logAction, toast])

  // === RELATÓRIOS E ESTATÍSTICAS ===
  const getEstatisticas = useCallback(() => {
    const romaneios = romaneiosCRUD.getAll()
    const entregas = entregasCRUD.getAll()
    const rotas = rotasCRUD.getAll()
    const expedicoes = expedicoesCRUD.getAll()

    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    const entregasMes = entregas.filter(e => new Date(e.dataEmissao) >= inicioMes)
    const entregasHoje = entregas.filter(e => {
      const dataEntrega = new Date(e.dataEmissao)
      return dataEntrega.toDateString() === hoje.toDateString()
    })

    return {
      romaneios: {
        total: romaneios.length,
        preparacao: romaneios.filter(r => r.status === 'preparacao').length,
        emTransito: romaneios.filter(r => r.status === 'em-transito').length,
        entregues: romaneios.filter(r => r.status === 'entregue').length
      },
      entregas: {
        total: entregas.length,
        hoje: entregasHoje.length,
        mes: entregasMes.length,
        pendentes: entregas.filter(e => ['preparacao', 'em-transito'].includes(e.status)).length,
        entregues: entregas.filter(e => e.status === 'entregue').length,
        tentativas: entregas.filter(e => e.tentativas > 0).length
      },
      rotas: {
        total: rotas.length,
        planejadas: rotas.filter(r => r.status === 'planejada').length,
        emAndamento: rotas.filter(r => r.status === 'em-andamento').length,
        finalizadas: rotas.filter(r => r.status === 'finalizada').length
      },
      expedicoes: {
        total: expedicoes.length,
        preparacao: expedicoes.filter(e => e.status === 'preparacao').length,
        separacao: expedicoes.filter(e => e.status === 'separacao').length,
        embarcadas: expedicoes.filter(e => e.status === 'embarcado').length
      }
    }
  }, [romaneiosCRUD, entregasCRUD, rotasCRUD, expedicoesCRUD])

  const getIndicadores = useCallback(() => {
    const entregas = entregasCRUD.getAll()
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    const entregasMes = entregas.filter(e => new Date(e.dataEmissao) >= inicioMes)
    const entregasEntregues = entregasMes.filter(e => e.status === 'entregue')
    const entregasNoPrazo = entregasEntregues.filter(e => {
      if (!e.dataPrevisao || !e.dataEntrega) return false
      return new Date(e.dataEntrega) <= new Date(e.dataPrevisao)
    })

    const taxaEntrega = entregasMes.length > 0 ? 
      (entregasEntregues.length / entregasMes.length) * 100 : 0

    const taxaPontualidade = entregasEntregues.length > 0 ? 
      (entregasNoPrazo.length / entregasEntregues.length) * 100 : 0

    const tempoMedioEntrega = entregasEntregues.reduce((total, entrega) => {
      if (!entrega.dataEmissao || !entrega.dataEntrega) return total
      const dias = Math.floor((new Date(entrega.dataEntrega) - new Date(entrega.dataEmissao)) / (1000 * 60 * 60 * 24))
      return total + dias
    }, 0) / (entregasEntregues.length || 1)

    return {
      taxaEntrega,
      taxaPontualidade,
      tempoMedioEntrega,
      entregasNoPrazo: entregasNoPrazo.length,
      entregasAtrasadas: entregasEntregues.length - entregasNoPrazo.length
    }
  }, [entregasCRUD])

  return {
    // CRUD básico
    romaneios: romaneiosCRUD,
    entregas: entregasCRUD,
    rotas: rotasCRUD,
    expedicoes: expedicoesCRUD,

    // Operações de romaneio
    criarRomaneio,
    atualizarStatusRomaneio,

    // Operações de entrega
    criarEntrega,
    atualizarStatusEntrega,
    confirmarEntrega,

    // Operações de rota
    criarRota,
    otimizarRota,

    // Operações de expedição
    criarExpedicao,
    separarItens,
    embarcarItens,

    // Relatórios e estatísticas
    getEstatisticas,
    getIndicadores
  }
}
