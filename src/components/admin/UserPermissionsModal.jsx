"use client"

import { useState, useEffect } from "react"
import { X, Shield, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

const modules = [
  { id: "cadastros", name: "Cadastros", description: "Dados mestres: clientes, fornecedores, produtos" },
  { id: "estoque", name: "Estoque", description: "Controle de estoque em tempo real" },
  { id: "abastecimento", name: "Abastecimento", description: "Controle de frota e equipamentos" },
  { id: "producao", name: "Produção", description: "Ordens de produção e planejamento" },
  { id: "logistica", name: "Logística", description: "Romaneios, fretes e expedição" },
  { id: "rh", name: "RH", description: "Recursos humanos e folha de pagamento" },
  { id: "compras", name: "Compras", description: "Requisições, cotações e pedidos" },
  { id: "financeiro", name: "Financeiro", description: "Contas a pagar/receber e fluxo de caixa" },
  { id: "comercial", name: "Comercial", description: "Pedidos de venda, propostas e faturamento" },
  { id: "faturamento", name: "Faturamento", description: "Emissão de NFe e comunicação com SEFAZ" },
  { id: "notas-fiscais", name: "Notas Fiscais", description: "Busca e armazena notas fiscais emitidas contra o CNPJ da empresa" },
  { id: "workflow", name: "Workflow", description: "Requisições e aprovações de processos" },
]

export default function UserPermissionsModal({ user, isOpen, onClose, onSave }) {
  const [selectedPermissions, setSelectedPermissions] = useState([])

  useEffect(() => {
    if (user) {
      setSelectedPermissions(user.permissions || [])
    }
  }, [user])

  if (!isOpen || !user) return null

  const togglePermission = (moduleId) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId)
      } else {
        return [...prev, moduleId]
      }
    })
  }

  const handleSave = () => {
    onSave(user.id, selectedPermissions)
    onClose()
    toast({
      title: "Permissões atualizadas",
      description: `Permissões do usuário ${user.name} foram atualizadas com sucesso.`,
    })
  }

  const selectAll = () => {
    setSelectedPermissions(modules.map((m) => m.id))
  }

  const clearAll = () => {
    setSelectedPermissions([])
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gerenciar Permissões
              </CardTitle>
              <CardDescription>
                Definir acesso aos módulos para: <strong>{user.name}</strong>
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-6">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Selecionar Todos
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Limpar Todos
            </Button>
            <span className="text-sm text-gray-500 ml-auto">
              {selectedPermissions.length} de {modules.length} selecionados
            </span>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module) => {
              const isSelected = selectedPermissions.includes(module.id)
              return (
                <div
                  key={module.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => togglePermission(module.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{module.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? "border-green-500 bg-green-500" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>

        <div className="border-t p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Salvar Permissões
          </Button>
        </div>
      </Card>
    </div>
  )
}