"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CotacaoModal = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  selectedRequisicao,
  requisicoes,
  fornecedores,
  produtos,
}) => {
  const [formData, setFormData] = useState({
    requisicaoId: "",
    dataVencimento: "",
    observacoes: "",
    aprovadorId: "",
    fornecedores: [],
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editingItem) {
      setFormData({
        requisicaoId: editingItem.requisicaoId || "",
        dataVencimento: editingItem.dataVencimento
          ? new Date(editingItem.dataVencimento).toISOString().split("T")[0]
          : "",
        observacoes: editingItem.observacoes || "",
        aprovadorId: editingItem.aprovadorId || "",
        fornecedores: editingItem.fornecedores || [],
      })
    } else if (selectedRequisicao) {
      const dataVencimento = new Date()
      dataVencimento.setDate(dataVencimento.getDate() + 7) // 7 dias para resposta

      setFormData({
        requisicaoId: selectedRequisicao.id,
        dataVencimento: dataVencimento.toISOString().split("T")[0],
        observacoes: "",
        aprovadorId: "",
        fornecedores: [],
      })
    } else {
      const dataVencimento = new Date()
      dataVencimento.setDate(dataVencimento.getDate() + 7)

      setFormData({
        requisicaoId: "",
        dataVencimento: dataVencimento.toISOString().split("T")[0],
        observacoes: "",
        aprovadorId: "",
        fornecedores: [],
      })
    }
    setErrors({})
  }, [editingItem, selectedRequisicao, isOpen])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const addFornecedor = () => {
    const requisicao = requisicoes.find((r) => r.id === Number.parseInt(formData.requisicaoId)) || selectedRequisicao
    if (!requisicao) return

    const novoFornecedor = {
      fornecedorId: "",
      prazoEntrega: 15,
      condicoesPagamento: "30 dias",
      frete: 0,
      itens: requisicao.itens.map((item) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: 0,
        precoTotal: 0,
      })),
      valorTotal: 0,
    }

    setFormData((prev) => ({
      ...prev,
      fornecedores: [...prev.fornecedores, novoFornecedor],
    }))
  }

  const removeFornecedor = (index) => {
    setFormData((prev) => ({
      ...prev,
      fornecedores: prev.fornecedores.filter((_, i) => i !== index),
    }))
  }

  const handleFornecedorChange = (index, field, value) => {
    const newFornecedores = [...formData.fornecedores]
    newFornecedores[index] = { ...newFornecedores[index], [field]: value }
    setFormData((prev) => ({ ...prev, fornecedores: newFornecedores }))
  }

  const handleItemChange = (fornecedorIndex, itemIndex, field, value) => {
    const newFornecedores = [...formData.fornecedores]
    const numValue = Number.parseFloat(value) || 0

    newFornecedores[fornecedorIndex].itens[itemIndex][field] = numValue

    // Recalcular preço total do item
    if (field === "precoUnitario" || field === "quantidade") {
      const item = newFornecedores[fornecedorIndex].itens[itemIndex]
      item.precoTotal = item.precoUnitario * item.quantidade
    }

    // Recalcular valor total do fornecedor
    const valorItens = newFornecedores[fornecedorIndex].itens.reduce((acc, item) => acc + item.precoTotal, 0)
    newFornecedores[fornecedorIndex].valorTotal = valorItens + (newFornecedores[fornecedorIndex].frete || 0)

    setFormData((prev) => ({ ...prev, fornecedores: newFornecedores }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.requisicaoId) {
      newErrors.requisicaoId = "Requisição é obrigatória"
    }

    if (!formData.dataVencimento) {
      newErrors.dataVencimento = "Data de vencimento é obrigatória"
    }

    if (!formData.aprovadorId) {
      newErrors.aprovadorId = "Aprovador é obrigatório"
    }

    if (formData.fornecedores.length === 0) {
      newErrors.fornecedores = "Pelo menos um fornecedor deve ser adicionado"
    }

    formData.fornecedores.forEach((fornecedor, index) => {
      if (!fornecedor.fornecedorId) {
        newErrors[`fornecedor_${index}_id`] = "Fornecedor é obrigatório"
      }

      fornecedor.itens.forEach((item, itemIndex) => {
        if (!item.precoUnitario || item.precoUnitario <= 0) {
          newErrors[`fornecedor_${index}_item_${itemIndex}_preco`] = "Preço deve ser maior que zero"
        }
      })
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      // Selecionar o fornecedor com menor valor total
      const fornecedorSelecionado = formData.fornecedores.reduce((menor, atual) =>
        atual.valorTotal < menor.valorTotal ? atual : menor,
      )

      const dataToSave = {
        ...formData,
        requisicaoId: Number.parseInt(formData.requisicaoId),
        dataVencimento: new Date(formData.dataVencimento).toISOString(),
        fornecedorSelecionado: fornecedorSelecionado.fornecedorId,
        valorTotal: fornecedorSelecionado.valorTotal,
      }
      onSave(dataToSave)
    }
  }

  const requisicao = requisicoes.find((r) => r.id === Number.parseInt(formData.requisicaoId)) || selectedRequisicao

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{editingItem ? "Editar Cotação" : "Nova Cotação"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados Gerais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requisicaoId">Requisição *</Label>
                <Select
                  value={formData.requisicaoId.toString()}
                  onValueChange={(value) => handleInputChange("requisicaoId", Number.parseInt(value))}
                  disabled={!!selectedRequisicao}
                >
                  <SelectTrigger className={errors.requisicaoId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione a requisição" />
                  </SelectTrigger>
                  <SelectContent>
                    {requisicoes.map((req) => (
                      <SelectItem key={req.id} value={req.id.toString()}>
                        {req.numero} - {req.solicitante}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.requisicaoId && <p className="text-red-500 text-sm mt-1">{errors.requisicaoId}</p>}
              </div>

              <div>
                <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  value={formData.dataVencimento}
                  onChange={(e) => handleInputChange("dataVencimento", e.target.value)}
                  className={errors.dataVencimento ? "border-red-500" : ""}
                />
                {errors.dataVencimento && <p className="text-red-500 text-sm mt-1">{errors.dataVencimento}</p>}
              </div>

              <div>
                <Label htmlFor="aprovadorId">Aprovador *</Label>
                <Select
                  value={formData.aprovadorId.toString()}
                  onValueChange={(value) => handleInputChange("aprovadorId", Number.parseInt(value))}
                >
                  <SelectTrigger className={errors.aprovadorId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o aprovador" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.aprovadorId && <p className="text-red-500 text-sm mt-1">{errors.aprovadorId}</p>}
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  placeholder="Observações da cotação..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Itens da Requisição */}
          {requisicao && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Itens da Requisição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {requisicao.itens.map((item, index) => {
                    const produto = produtos.find((p) => p.id === item.produtoId)
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{produto?.descricao || "Produto não encontrado"}</p>
                          <p className="text-sm text-gray-600">Código: {produto?.codigo}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {item.quantidade} {item.unidade}
                          </p>
                          <p className="text-sm text-gray-600">{item.justificativa}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fornecedores */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Fornecedores</CardTitle>
              <Button
                type="button"
                onClick={addFornecedor}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={!requisicao}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Fornecedor
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {errors.fornecedores && <p className="text-red-500 text-sm">{errors.fornecedores}</p>}

              {formData.fornecedores.map((fornecedor, fornecedorIndex) => (
                <div key={fornecedorIndex} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Fornecedor {fornecedorIndex + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFornecedor(fornecedorIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Fornecedor *</Label>
                      <Select
                        value={fornecedor.fornecedorId.toString()}
                        onValueChange={(value) =>
                          handleFornecedorChange(fornecedorIndex, "fornecedorId", Number.parseInt(value))
                        }
                      >
                        <SelectTrigger className={errors[`fornecedor_${fornecedorIndex}_id`] ? "border-red-500" : ""}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {fornecedores.map((forn) => (
                            <SelectItem key={forn.id} value={forn.id.toString()}>
                              {forn.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[`fornecedor_${fornecedorIndex}_id`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`fornecedor_${fornecedorIndex}_id`]}</p>
                      )}
                    </div>

                    <div>
                      <Label>Prazo Entrega (dias)</Label>
                      <Input
                        type="number"
                        value={fornecedor.prazoEntrega}
                        onChange={(e) =>
                          handleFornecedorChange(fornecedorIndex, "prazoEntrega", Number.parseInt(e.target.value))
                        }
                      />
                    </div>

                    <div>
                      <Label>Condições Pagamento</Label>
                      <Input
                        value={fornecedor.condicoesPagamento}
                        onChange={(e) => handleFornecedorChange(fornecedorIndex, "condicoesPagamento", e.target.value)}
                        placeholder="Ex: 30 dias"
                      />
                    </div>

                    <div>
                      <Label>Frete (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={fornecedor.frete}
                        onChange={(e) => {
                          const frete = Number.parseFloat(e.target.value) || 0
                          handleFornecedorChange(fornecedorIndex, "frete", frete)
                          // Recalcular valor total
                          const valorItens = fornecedor.itens.reduce((acc, item) => acc + item.precoTotal, 0)
                          handleFornecedorChange(fornecedorIndex, "valorTotal", valorItens + frete)
                        }}
                      />
                    </div>
                  </div>

                  {/* Itens do Fornecedor */}
                  <div className="space-y-3">
                    <h5 className="font-medium">Preços dos Itens</h5>
                    {fornecedor.itens.map((item, itemIndex) => {
                      const produto = produtos.find((p) => p.id === item.produtoId)
                      return (
                        <div
                          key={itemIndex}
                          className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center p-3 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="font-medium text-sm">{produto?.descricao}</p>
                            <p className="text-xs text-gray-600">
                              {item.quantidade} {requisicao?.itens[itemIndex]?.unidade}
                            </p>
                          </div>

                          <div>
                            <Label className="text-xs">Preço Unit. (R$) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.precoUnitario}
                              onChange={(e) =>
                                handleItemChange(fornecedorIndex, itemIndex, "precoUnitario", e.target.value)
                              }
                              className={`text-sm ${errors[`fornecedor_${fornecedorIndex}_item_${itemIndex}_preco`] ? "border-red-500" : ""}`}
                            />
                            {errors[`fornecedor_${fornecedorIndex}_item_${itemIndex}_preco`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`fornecedor_${fornecedorIndex}_item_${itemIndex}_preco`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label className="text-xs">Preço Total (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.precoTotal}
                              readOnly
                              className="text-sm bg-gray-100"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        Valor Total: R$ {fornecedor.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {editingItem ? "Atualizar" : "Criar"} Cotação
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CotacaoModal
