
import React from 'react'
import { Check, Clock, AlertCircle, Play } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

const getStepIcon = (status) => {
  switch (status) {
    case 'completed':
      return <Check className="h-4 w-4 text-green-600" />
    case 'in_progress':
      return <Play className="h-4 w-4 text-blue-600" />
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />
    case 'rejected':
      return <AlertCircle className="h-4 w-4 text-red-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

const getStepColor = (status) => {
  switch (status) {
    case 'completed':
      return 'border-green-200 bg-green-50'
    case 'in_progress':
      return 'border-blue-200 bg-blue-50'
    case 'pending':
      return 'border-yellow-200 bg-yellow-50'
    case 'rejected':
      return 'border-red-200 bg-red-50'
    default:
      return 'border-gray-200 bg-gray-50'
  }
}

export default function WorkflowSteps({ steps, currentStep = 0 }) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep
        const status = isCompleted ? 'completed' : isActive ? 'in_progress' : 'pending'
        
        return (
          <Card key={index} className={`${getStepColor(status)} ${isActive ? 'ring-2 ring-blue-300' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(status)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{step.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  {step.assignee && (
                    <p className="text-xs text-gray-500 mt-2">
                      Responsável: {step.assignee}
                    </p>
                  )}
                  {step.dueDate && (
                    <p className="text-xs text-gray-500">
                      Prazo: {new Date(step.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                {step.duration && (
                  <div className="text-xs text-gray-500">
                    {step.duration}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
