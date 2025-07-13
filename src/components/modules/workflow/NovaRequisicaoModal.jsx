
"use client"

import { useState } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NovaRequisicaoModal({ isOpen, onClose, onSave, produtos }) {
  const [formData, setFormData] = useState({
    departamento: "",
    centroGasto: "",
    justificativa: "",
    prioridade: "media",
    itens: [{ produtoId: "", quantidade: 1, observacoes: "" }],
  })

  if (!isOpen) return null

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (index, field, value) => {
    const newItens = [...formData.itens]
    newItens[index] = { ...newItens[index], [field]: value }
    setFormData(prev => ({ ...prev, itens: newItens }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { produtoId: "", quantidade: 1, observacoes: "" }]
    }))
  }

  const removeItem = (index) => {
    if (formData.itens.length > 1) {
      setFormData(prev => ({
        ...prev,
        itens: prev.itens.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validação básica
    if (!formData.departamento || !formData.justificativa) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    if (formData.itens.some(item => !item.produtoId || item.quantidade <= 0)) {
      alert("Preencha todos os itens corretamente")
      return
    }

    onSave(formData)
    
    // Reset form
    setFormData({
      departamento: "",
      centroGasto: "",
      justificativa: "",
      prioridade: "media",
      itens: [{ produtoId: "", quantidade: 1, observacoes: "" }],
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Nova Requisição</CardTitle>
              <CardDescription>Crie uma nova requisição de materiais</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-6">
              {/* Informações Gerais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento *
                  </label>
                  <Input
                    value={formData.departamento}
                    onChange={(e) => handleInputChange("departamento", e.target.value)}
                    placeholder="Ex: Produção, Administrativo..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Centro de Gasto
                  </label>
                  <Input
                    value={formData.centroGasto}
                    onChange={(e) => handleInputChange("centroGasto", e.target.value)}
                    placeholder="Ex: PROD001, ADM001..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <Select value={formData.prioridade} onValueChange={(value) => handleInputChange("prioridade", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Justificativa *
                  </label>
                  <textarea
                    value={formData.justificativa}
                    onChange={(e) => handleInputChange("justificativa", e.target.value)}
                    placeholder="Descreva o motivo da requisição..."
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Itens */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Itens da Requisição</h3>
                  <Button type="button" onClick={addItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.itens.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Produto *
                          </label>
                          <Select
                            value={item.produtoId}
                            onValueChange={(value) => handleItemChange(index, "produtoId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {produtos.map((produto) => (
                                <SelectItem key={produto.id} value={produto.id.toString()}>
                                  {produto.descricao} - {produto.codigo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantidade *
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => handleItemChange(index, "quantidade", parseInt(e.target.value) || 1)}
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={formData.itens.length === 1}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observações
                          </label>
                          <Input
                            value={item.observacoes}
                            onChange={(e) => handleItemChange(index, "observacoes", e.target.value)}
                            placeholder="Observações do item..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>

          <div className="border-t p-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Criar Requisição
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
