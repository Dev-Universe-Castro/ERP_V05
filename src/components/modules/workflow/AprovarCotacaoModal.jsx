
"use client"

import { useState } from "react"
import { X, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AprovarCotacaoModal({ isOpen, onClose, cotacao, onConfirmar, fornecedores, produtos }) {
  const [decisao, setDecisao] = useState("")
  const [observacoes, setObservacoes] = useState("")

  if (!isOpen || !cotacao) return null

  const fornecedor = fornecedores.find(f => f.id === cotacao.fornecedorSelecionado)

  const handleConfirmar = () => {
    if (!decisao) {
      alert("Selecione uma decisão")
      return
    }

    onConfirmar({
      decisao,
      observacoes,
    })

    setDecisao("")
    setObservacoes("")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Aprovar Cotação - {cotacao.numero}</CardTitle>
              <CardDescription>Analise os detalhes da cotação antes de aprovar</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Informações da Cotação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Número</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{cotacao.numero}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Emissão</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(cotacao.dataEmissao).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fornecedor Selecionado</label>
                <p className="mt-1 text-sm text-gray-900">{fornecedor?.nome || "N/A"}</p>
              </div>
            </div>

            {/* Fornecedores e Preços */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Comparação de Fornecedores</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fornecedor</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Valor Total</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Prazo Entrega</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Selecionado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cotacao.fornecedores?.map((fornecedorCotacao, index) => {
                      const fornecedorData = fornecedores.find(f => f.id === fornecedorCotacao.fornecedorId)
                      const isSelected = fornecedorCotacao.fornecedorId === cotacao.fornecedorSelecionado
                      
                      return (
                        <tr key={index} className={isSelected ? "bg-green-50" : ""}>
                          <td className="px-4 py-2 text-sm text-gray-900">{fornecedorData?.nome}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            R$ {fornecedorCotacao.valorTotal?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-center">
                            {fornecedorCotacao.prazoEntrega} dias
                          </td>
                          <td className="px-4 py-2 text-center">
                            {isSelected && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Selecionado
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Itens da Cotação */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Itens Cotados pelo Fornecedor Selecionado</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Produto</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Quantidade</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Valor Unit.</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cotacao.fornecedores
                      ?.find(f => f.fornecedorId === cotacao.fornecedorSelecionado)
                      ?.itens?.map((item, index) => {
                        const produto = produtos.find(p => p.id === item.produtoId)
                        return (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{produto?.descricao}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-center">{item.quantidade}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              R$ {item.precoUnitario?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">
                              R$ {item.precoTotal?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Decisão */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Decisão</h3>
              
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant={decisao === "aprovada" ? "default" : "outline"}
                  onClick={() => setDecisao("aprovada")}
                  className={decisao === "aprovada" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
                
                <Button
                  type="button"
                  variant={decisao === "rejeitada" ? "default" : "outline"}
                  onClick={() => setDecisao("rejeitada")}
                  className={decisao === "rejeitada" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Adicione observações sobre sua decisão..."
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </CardContent>

        <div className="border-t p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={!decisao}>
            Confirmar Decisão
          </Button>
        </div>
      </Card>
    </div>
  )
}
