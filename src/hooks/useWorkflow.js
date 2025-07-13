import { useState, useCallback } from 'react'
import { useToast } from '../components/ui/use-toast'

export const useWorkflow = () => {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const createWorkflow = useCallback(async (workflowData) => {
    setLoading(true)
    try {
      // Simular criação de workflow
      const newWorkflow = {
        id: Date.now(),
        ...workflowData,
        status: 'draft',
        createdAt: new Date().toISOString(),
        currentStep: 0,
        history: []
      }
      setWorkflows(prev => [...prev, newWorkflow])
      toast({
        title: "Workflow criado",
        description: "Novo workflow foi criado com sucesso."
      })
      return newWorkflow
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar workflow.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const updateWorkflowStatus = useCallback(async (workflowId, newStatus, comments = '') => {
    setLoading(true)
    try {
      setWorkflows(prev => prev.map(workflow => 
        workflow.id === workflowId 
          ? {
              ...workflow,
              status: newStatus,
              history: [...workflow.history, {
                status: newStatus,
                timestamp: new Date().toISOString(),
                comments
              }]
            }
          : workflow
      ))
      toast({
        title: "Status atualizado",
        description: `Workflow ${newStatus} com sucesso.`
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const getWorkflowsByStatus = useCallback((status) => {
    return workflows.filter(workflow => workflow.status === status)
  }, [workflows])

  const getActiveWorkflows = useCallback(() => {
    return workflows.filter(w => ['pending', 'in_progress'].includes(w.status))
  }, [workflows])

  return {
    workflows,
    loading,
    createWorkflow,
    updateWorkflowStatus,
    getWorkflowsByStatus,
    getActiveWorkflows
  }
}