
import { useCallback } from 'react'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/ui/use-toast'
import { useAuditLog } from './useAuditLog'

export const useCRUD = (entityType) => {
  const { queryItems, findById, insertItem, updateItem, deleteItem } = useData()
  const { toast } = useToast()
  const { logAction } = useAuditLog()

  // Validações específicas por entidade
  const validateData = useCallback((data, operation = 'create') => {
    const validations = {
      clientes: (item) => {
        if (!item.nome?.trim()) return 'Nome é obrigatório'
        if (!item.email?.trim()) return 'Email é obrigatório'
        if (!/\S+@\S+\.\S+/.test(item.email)) return 'Email inválido'
        return null
      },
      fornecedores: (item) => {
        if (!item.nome?.trim()) return 'Nome é obrigatório'
        if (!item.cnpj?.trim()) return 'CNPJ é obrigatório'
        if (!item.email?.trim()) return 'Email é obrigatório'
        return null
      },
      produtos: (item) => {
        if (!item.nome?.trim()) return 'Nome é obrigatório'
        if (!item.codigo?.trim()) return 'Código é obrigatório'
        if (!item.categoria?.trim()) return 'Categoria é obrigatória'
        if (item.preco < 0) return 'Preço deve ser positivo'
        return null
      },
      funcionarios: (item) => {
        if (!item.nome?.trim()) return 'Nome é obrigatório'
        if (!item.cpf?.trim()) return 'CPF é obrigatório'
        if (!item.cargo?.trim()) return 'Cargo é obrigatório'
        if (!item.email?.trim()) return 'Email é obrigatório'
        return null
      },
      ordensProducao: (item) => {
        if (!item.numero?.trim()) return 'Número é obrigatório'
        if (!item.produto?.trim()) return 'Produto é obrigatório'
        if (!item.quantidade || item.quantidade <= 0) return 'Quantidade deve ser positiva'
        return null
      },
      requisicoes: (item) => {
        if (!item.numero?.trim()) return 'Número é obrigatório'
        if (!item.solicitante?.trim()) return 'Solicitante é obrigatório'
        if (!item.itens || item.itens.length === 0) return 'Pelo menos um item é obrigatório'
        return null
      },
      cotacoes: (item) => {
        if (!item.numero?.trim()) return 'Número é obrigatório'
        if (!item.fornecedores || item.fornecedores.length === 0) return 'Pelo menos um fornecedor é obrigatório'
        return null
      },
      pedidosCompra: (item) => {
        if (!item.numero?.trim()) return 'Número é obrigatório'
        if (!item.fornecedor?.trim()) return 'Fornecedor é obrigatório'
        if (!item.itens || item.itens.length === 0) return 'Pelo menos um item é obrigatório'
        return null
      }
    }

    const validator = validations[entityType]
    return validator ? validator(data) : null
  }, [entityType])

  // Buscar todos com filtros
  const getAll = useCallback((filters = {}) => {
    try {
      const items = queryItems(entityType, filters)
      logAction('query', entityType, null, { filters, count: items.length })
      return items
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: `Erro ao buscar ${entityType}: ${error.message}`,
        variant: "destructive"
      })
      return []
    }
  }, [entityType, queryItems, logAction, toast])

  // Buscar por ID
  const getById = useCallback((id) => {
    try {
      const item = findById(entityType, id)
      if (item) {
        logAction('query_by_id', entityType, id)
      }
      return item
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: `Erro ao buscar ${entityType}: ${error.message}`,
        variant: "destructive"
      })
      return null
    }
  }, [entityType, findById, logAction, toast])

  // Criar novo item
  const create = useCallback(async (data) => {
    try {
      // Validar dados
      const validationError = validateData(data, 'create')
      if (validationError) {
        toast({
          title: "Erro de validação",
          description: validationError,
          variant: "destructive"
        })
        return null
      }

      // Inserir item
      const newItem = insertItem(entityType, {
        ...data,
        status: data.status || 'ativo'
      })

      if (newItem) {
        toast({
          title: "Sucesso",
          description: `${entityType} criado com sucesso!`
        })
        logAction('create', entityType, newItem.id, { data: newItem })
      }

      return newItem
    } catch (error) {
      toast({
        title: "Erro ao criar",
        description: `Erro ao criar ${entityType}: ${error.message}`,
        variant: "destructive"
      })
      return null
    }
  }, [entityType, insertItem, validateData, logAction, toast])

  // Atualizar item
  const update = useCallback(async (id, updates) => {
    try {
      // Buscar item atual
      const currentItem = findById(entityType, id)
      if (!currentItem) {
        toast({
          title: "Item não encontrado",
          description: `${entityType} com ID ${id} não encontrado`,
          variant: "destructive"
        })
        return null
      }

      // Validar dados atualizados
      const updatedData = { ...currentItem, ...updates }
      const validationError = validateData(updatedData, 'update')
      if (validationError) {
        toast({
          title: "Erro de validação",
          description: validationError,
          variant: "destructive"
        })
        return null
      }

      // Atualizar item
      const updatedItem = updateItem(entityType, id, updates)

      if (updatedItem) {
        toast({
          title: "Sucesso",
          description: `${entityType} atualizado com sucesso!`
        })
        logAction('update', entityType, id, { 
          before: currentItem, 
          after: updatedItem,
          changes: updates 
        })
      }

      return updatedItem
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: `Erro ao atualizar ${entityType}: ${error.message}`,
        variant: "destructive"
      })
      return null
    }
  }, [entityType, findById, updateItem, validateData, logAction, toast])

  // Deletar item
  const remove = useCallback(async (id) => {
    try {
      // Buscar item atual para log
      const currentItem = findById(entityType, id)
      if (!currentItem) {
        toast({
          title: "Item não encontrado",
          description: `${entityType} com ID ${id} não encontrado`,
          variant: "destructive"
        })
        return false
      }

      // Deletar item
      const deleted = deleteItem(entityType, id)

      if (deleted) {
        toast({
          title: "Sucesso",
          description: `${entityType} removido com sucesso!`
        })
        logAction('delete', entityType, id, { deletedData: currentItem })
      }

      return deleted
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: `Erro ao remover ${entityType}: ${error.message}`,
        variant: "destructive"
      })
      return false
    }
  }, [entityType, findById, deleteItem, logAction, toast])

  // Buscar com paginação
  const getPaginated = useCallback((page = 1, limit = 10, filters = {}) => {
    try {
      const allItems = queryItems(entityType, filters)
      const total = allItems.length
      const totalPages = Math.ceil(total / limit)
      const offset = (page - 1) * limit
      const items = allItems.slice(offset, offset + limit)

      logAction('paginated_query', entityType, null, { 
        page, 
        limit, 
        filters, 
        total,
        totalPages 
      })

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: `Erro ao buscar ${entityType}: ${error.message}`,
        variant: "destructive"
      })
      return {
        items: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    }
  }, [entityType, queryItems, logAction, toast])

  // Contagem por status
  const getCountByStatus = useCallback(() => {
    try {
      const items = queryItems(entityType)
      const counts = items.reduce((acc, item) => {
        const status = item.status || 'indefinido'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})

      return counts
    } catch (error) {
      console.error(`Erro ao contar ${entityType} por status:`, error)
      return {}
    }
  }, [entityType, queryItems])

  return {
    // Operações CRUD
    getAll,
    getById,
    create,
    update,
    remove,
    
    // Operações adicionais
    getPaginated,
    getCountByStatus,
    
    // Utilitários
    validateData
  }
}
