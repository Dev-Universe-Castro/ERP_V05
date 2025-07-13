
"use client"

import { X, Calendar, User, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DetalhesWorkflowModal({ isOpen, onClose, item, produtos }) {
  if (!isOpen || !item) return null

  const getStatusBadge = (status) => {
    const statusMap = {
      "pendente-aprovacao": "bg-yellow-100 text-yellow-800",
      "aprovado": "bg-green-100 text-green-800",
      "rejeitado": "bg-red-100 text-red-800",
      "em-analise": "bg-blue-100 text-blue-800",
      "cancelado": "bg-gray-100 text-gray-800",
    }
    return statusMap[status] || "bg-gray-100 text-gray-800"
  }

  const getPrioridadeBadge = (prioridade) => {
    const prioridadeMap = {
      "baixa": "bg-green-100 text-green-800",
      "media": "bg-yellow-100 text-yellow-800",
      "alta": "bg-red-100 text-red-800",
    }
    return prioridadeMap[prioridade] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Detalhes - {item.numero}</CardTitle>
              <CardDescription>
                {item.tipo === "requisicao-usuario" ? "Requisição de Material" : "Aprovação de Cotação"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Informações Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{item.numero}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Solicitante</label>
                  <div className="mt-1 flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{item.solicitante}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data da Requisição</label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {new Date(item.dataRequisicao).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Departamento</label>
                  <p className="mt-1 text-sm text-gray-900">{item.departamento}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioridadeBadge(item.prioridade)}`}>
                      {item.prioridade}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Justificativa */}
            {item.justificativa && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Justificativa</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">{item.justificativa}</p>
                </div>
              </div>
            )}

            {/* Centro de Gasto */}
            {item.centroGasto && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Centro de Gasto</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{item.centroGasto}</p>
              </div>
            )}

            {/* Itens */}
            {item.itens && item.itens.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Itens Solicitados</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Produto</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Código</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Quantidade</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Observações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {item.itens.map((itemReq, index) => {
                        const produto = produtos.find(p => p.id === parseInt(itemReq.produtoId))
                        return (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{produto?.descricao || "Produto não encontrado"}</td>
                            <td className="px-4 py-2 text-sm text-gray-600 font-mono">{produto?.codigo || "N/A"}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-center">{itemReq.quantidade}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{itemReq.observacoes || "-"}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aprovação */}
            {item.aprovador && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-medium text-green-900">Informações de Aprovação</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700">Aprovado por</label>
                    <p className="mt-1 text-sm text-green-900">{item.aprovador}</p>
                  </div>
                  {item.dataAprovacao && (
                    <div>
                      <label className="block text-sm font-medium text-green-700">Data de Aprovação</label>
                      <p className="mt-1 text-sm text-green-900">
                        {new Date(item.dataAprovacao).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}
                </div>
                {item.observacoesAprovacao && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-green-700">Observações da Aprovação</label>
                    <p className="mt-1 text-sm text-green-900">{item.observacoesAprovacao}</p>
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline do Processo</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Requisição criada</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.dataRequisicao).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(item.dataRequisicao).toLocaleTimeString("pt-BR")}
                    </p>
                  </div>
                </div>

                {item.aprovador && item.dataAprovacao && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Aprovação realizada</p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.dataAprovacao).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(item.dataAprovacao).toLocaleTimeString("pt-BR")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <div className="border-t p-6 flex justify-end">
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </Card>
    </div>
  )
}
