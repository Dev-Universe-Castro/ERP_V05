
import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

export const useAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState([])
  const { user } = useAuth()

  const logAction = useCallback((action, module, entityId, details = {}) => {
    const logEntry = {
      id: Date.now(),
      userId: user?.id,
      userName: user?.name,
      action,
      module,
      entityId,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1' // Simulated
    }
    
    setAuditLogs(prev => [logEntry, ...prev])
    
    // Em produção, enviar para servidor
    console.log('Audit Log:', logEntry)
  }, [user])

  const getLogsByModule = useCallback((module) => {
    return auditLogs.filter(log => log.module === module)
  }, [auditLogs])

  const getLogsByUser = useCallback((userId) => {
    return auditLogs.filter(log => log.userId === userId)
  }, [auditLogs])

  return {
    auditLogs,
    logAction,
    getLogsByModule,
    getLogsByUser
  }
}
