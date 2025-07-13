
import React from 'react'
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

export default function CompliancePanel({ module, complianceRules = [] }) {
  const getComplianceStatus = (rule) => {
    // Lógica simplificada - em produção seria mais complexa
    return Math.random() > 0.3 ? 'compliant' : 'non_compliant'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'non_compliant':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'non_compliant':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const defaultRules = [
    {
      id: 'data_retention',
      name: 'Retenção de Dados',
      description: 'Dados mantidos conforme política de retenção',
      category: 'LGPD'
    },
    {
      id: 'access_control',
      name: 'Controle de Acesso',
      description: 'Usuários com permissões adequadas',
      category: 'Segurança'
    },
    {
      id: 'audit_trail',
      name: 'Trilha de Auditoria',
      description: 'Registros de auditoria completos',
      category: 'Governança'
    },
    {
      id: 'backup_policy',
      name: 'Política de Backup',
      description: 'Backups realizados conforme cronograma',
      category: 'Continuidade'
    }
  ]

  const rules = complianceRules.length > 0 ? complianceRules : defaultRules

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Conformidade e Governança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.map((rule) => {
          const status = getComplianceStatus(rule)
          return (
            <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-start gap-3">
                {getStatusIcon(status)}
                <div>
                  <h4 className="font-medium text-gray-900">{rule.name}</h4>
                  <p className="text-sm text-gray-600">{rule.description}</p>
                  <Badge variant="outline" className="mt-2">
                    {rule.category}
                  </Badge>
                </div>
              </div>
              <Badge className={getStatusColor(status)}>
                {status === 'compliant' ? 'Conforme' : 
                 status === 'non_compliant' ? 'Não Conforme' : 'Pendente'}
              </Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
