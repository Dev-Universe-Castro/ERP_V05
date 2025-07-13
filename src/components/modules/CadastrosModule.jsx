"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Package, Building2, Truck, Plus, Search, Download, 
  Edit, Trash2, Eye, X, Save, Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import CadastrosSidebar from './cadastros/CadastrosSidebar';
import * as XLSX from 'xlsx';
import { Badge } from "@/components/ui/badge"
import { Filter, Upload } from "lucide-react"

const BOMManager = ({ bom, setBom, materiasPrimas, errors }) => {
  const addComponent = () => {
    setBom([...bom, { materiaPrimaId: "", quantidade: 0, unidade: "TON" }])
  }

  const removeComponent = (index) => {
    setBom(bom.filter((_, i) => i !== index))
  }

  const updateComponent = (index, field, value) => {
    const newBom = [...bom]
    newBom[index] = { ...newBom[index], [field]: value }
    setBom(newBom)
  }

  const calculateTotalCost = () => {
    return bom.reduce((total, component) => {
      const materiaPrima = materiasPrimas.find(
        (mp) => mp.id === Number.parseInt(component.materiaPrimaId)
      )
      if (materiaPrima && component.quantidade) {
        return total + materiaPrima.custo * component.quantidade
      }
      return total
    }, 0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          Lista de Materiais (BOM)
        </Label>
        <Button type="button" onClick={addComponent} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Componente
        </Button>
      </div>

      {bom.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Nenhum componente adicionado</p>
          <p className="text-sm text-gray-400">
            Clique em "Adicionar Componente" para começar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bom.map((component, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-3 items-end p-3 border rounded-lg bg-gray-50"
            >
              <div className="col-span-5">
                <Label className="text-sm">Matéria Prima</Label>
                <Select
                  value={component.materiaPrimaId.toString()}
                  onValueChange={(value) =>
                    updateComponent(index, "materiaPrimaId", Number.parseInt(value))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione a matéria prima" />
                  </SelectTrigger>
                  <SelectContent>
                    {materiasPrimas.map((mp) => (
                      <SelectItem key={mp.id} value={mp.id.toString()}>
                        {mp.codigo} - {mp.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Label className="text-sm">Quantidade</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={component.quantidade}
                  onChange={(e) =>
                    updateComponent(
                      index,
                      "quantidade",
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                  className="h-9"
                  placeholder="0.000"
                />
              </div>

              <div className="col-span-2">
                <Label className="text-sm">Unidade</Label>
                <Select
                  value={component.unidade}
                  onValueChange={(value) => updateComponent(index, "unidade", value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TON">TON</SelectItem>
                    <SelectItem value="KG">KG</SelectItem>
                    <SelectItem value="G">G</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Button
                  type="button"
                  onClick={() => removeComponent(index)}
                  size="sm"
                  variant="destructive"
                  className="h-9 w-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Resumo do BOM */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  Custo Total Calculado:
                </span>
              </div>
              <span className="text-xl font-bold text-blue-800">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(calculateTotalCost())}
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Baseado nos custos das matérias-primas selecionadas
            </p>
          </div>
        </div>
      )}

      {errors.bom && <span className="text-red-500 text-sm">{errors.bom}</span>}
    </div>
  )
}

const CadastroForm = ({ type, item, onSave, onCancel }) => {
  const { data, calculateBOMCost } = useData()
  const [formData, setFormData] = useState(item || {})
  const [errors, setErrors] = useState({})
  const [bom, setBom] = useState(item?.bom || [])

  // Atualizar custo automaticamente quando BOM muda
  useEffect(() => {
    if (formData.tipo === "Produto Acabado" && bom.length > 0) {
      const custoCalculado = calculateBOMCost(bom, data.produtos || [])
      setFormData((prev) => ({ ...prev, custo: custoCalculado }))
    }
  }, [bom, formData.tipo, calculateBOMCost, data.produtos])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validações comuns
    if (!formData.nome?.trim() && !formData.descricao?.trim()) {
      const field = type === "produtos" ? "descricao" : "nome"
      newErrors[field] = `${
        type === "produtos" ? "Descrição" : "Nome"
      } é obrigatório`
    }

    if (type !== "produtos") {
      if (!formData.email?.trim()) {
        newErrors.email = "Email é obrigatório"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email inválido"
      }

      if (!formData.telefone?.trim()) {
        newErrors.telefone = "Telefone é obrigatório"
      }
    }

    // Validações específicas por tipo
    if (type === "produtos") {
      if (!formData.tipo?.trim()) {
        newErrors.tipo = "Tipo é obrigatório"
      }
      if (!formData.categoria?.trim()) {
        newErrors.categoria = "Categoria é obrigatória"
      }
      if (!formData.unidade?.trim()) {
        newErrors.unidade = "Unidade é obrigatória"
      }

      // Validação específica para Produto Acabado
      if (formData.tipo === "Produto Acabado") {
        if (!bom || bom.length === 0) {
          newErrors.bom =
            "Produto acabado deve ter pelo menos um componente no BOM"
        } else {
          // Validar cada componente do BOM
          const bomErrors = bom.some(
            (component) =>
              !component.materiaPrimaId ||
              !component.quantidade ||
              component.quantidade <= 0
          )
          if (bomErrors) {
            newErrors.bom =
              "Todos os componentes do BOM devem ter matéria prima e quantidade válidas"
          }
        }
      }

      // Validação de custo apenas para produtos que têm custo
      const tiposComCusto = [
        "Matéria Prima",
        "Produto Acabado",
        "Insumo",
        "Item Consumo",
        "Combustível",
        "Outros",
      ]
      if (
        tiposComCusto.includes(formData.tipo) &&
        (!formData.custo || formData.custo <= 0)
      ) {
        newErrors.custo = "Custo deve ser maior que zero"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      // Gerar código automático se não existir
      if (!formData.codigo) {
        const prefix = {
          clientes: "CLI",
          fornecedores: "FOR",
          transportadoras: "TRA",
          produtos: getProdutoPrefix(formData.tipo),
        }[type]
        const nextNumber = String(Date.now()).slice(-3).padStart(3, "0")
        formData.codigo = `${prefix}${nextNumber}`
      }

      // Adicionar BOM se for produto acabado
      if (formData.tipo === "Produto Acabado") {
        formData.bom = bom
        formData.bomId = `BOM${formData.codigo?.replace(/\D/g, "") || "001"}`
      }

      onSave(formData)
    }
  }

  const getProdutoPrefix = (tipo) => {
    const prefixMap = {
      "Matéria Prima": "MP",
      "Produto Acabado": "PA",
      Insumo: "INS",
      "Material Marketing": "MKT",
      Ativo: "ATV",
      "Item Consumo": "CON",
      Combustível: "CMB",
      Outros: "OUT",
    }
    return prefixMap[tipo] || "PROD"
  }

  const getTipoOptions = () => [
    "Matéria Prima",
    "Produto Acabado",
    "Insumo",
    "Material Marketing",
    "Ativo",
    "Item Consumo",
    "Combustível",
    "Outros",
  ]

  const getCategoriaOptions = (tipo) => {
    const categoriaMap = {
      "Matéria Prima": ["Fertilizante Base", "Produto Químico", "Mineral", "Orgânico"],
      "Produto Acabado": ["Fertilizante Formulado", "Defensivo", "Semente", "Adubo Orgânico"],
      Insumo: ["Aditivo", "Corretivo", "Inoculante", "Adjuvante"],
      "Material Marketing": ["Embalagem", "Identificação", "Promocional", "Comunicação"],
      Ativo: ["Equipamento", "Veículo", "Imóvel", "Tecnologia"],
      "Item Consumo": ["Segurança", "Limpeza", "Escritório", "Manutenção"],
      Combustível: ["Combustível", "Lubrificante", "Gás"],
      Outros: ["Logística", "Serviço", "Diversos"],
    }
    return categoriaMap[tipo] || []
  }

  const getSubcategoriaOptions = (categoria) => {
    const subcategoriaMap = {
      "Fertilizante Base": ["Nitrogenado", "Fosfatado", "Potássico", "Micronutriente"],
      "Fertilizante Formulado": ["NPK", "Binário", "Especialidade", "Foliar"],
      Embalagem: ["Saco", "Big Bag", "Tambor", "Caixa"],
      Equipamento: ["Produção", "Movimentação", "Medição", "Controle"],
      Segurança: ["EPI", "Sinalização", "Emergência", "Proteção"],
      Combustível: ["Diesel", "Gasolina", "Etanol", "GLP"],
      Logística: ["Pallet", "Container", "Amarração", "Proteção"],
    }
    return subcategoriaMap[categoria] || []
  }

  const getUnidadeOptions = () => ["TON", "KG", "G", "L", "ML", "M3", "UN", "SC", "CX", "M", "M2"]

  // Filtrar apenas matérias-primas para o BOM
  const materiasPrimas = (data.produtos || []).filter(
    (p) => p.tipo === "Matéria Prima"
  )

  const renderFormFields = () => {
    switch (type) {
      case "clientes":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo || ""}
                  onChange={(e) => handleChange("codigo", e.target.value)}
                  placeholder="Será gerado automaticamente"
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo || ""}
                  onValueChange={(value) => handleChange("tipo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                    <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="nome">Nome/Razão Social *</Label>
              <Input
                id="nome"
                value={formData.nome || ""}
                onChange={(e) => handleChange("nome", e.target.value)}
                className={errors.nome ? "border-red-500" : ""}
              />
              {errors.nome && (
                <span className="text-red-500 text-sm">{errors.nome}</span>
              )}
            </div>

            <div>
              <Label htmlFor="cnpj">CPF/CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj || ""}
                onChange={(e) => handleChange("cnpj", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email}</span>
                )}
              </div>
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone || ""}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                  className={errors.telefone ? "border-red-500" : ""}
                />
                {errors.telefone && (
                  <span className="text-red-500 text-sm">{errors.telefone}</span>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco || ""}
                onChange={(e) => handleChange("endereco", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade || ""}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado || ""}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep || ""}
                  onChange={(e) => handleChange("cep", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="faturamento">Faturamento Anual (R$)</Label>
              <Input
                id="faturamento"
                type="number"
                value={formData.faturamento || ""}
                onChange={(e) =>
                  handleChange("faturamento", Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.ativo === false ? "inativo" : "ativo"}
                  onValueChange={(value) => handleChange("ativo", value === "ativo")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dataUltimaCompra">Última Compra</Label>
                <Input
                  id="dataUltimaCompra"
                  type="date"
                  value={formData.dataUltimaCompra || ""}
                  onChange={(e) => handleChange("dataUltimaCompra", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={formData.observacoes || ""}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                placeholder="Informações adicionais sobre o cliente"
              />
            </div>
          </>
        )

      case "fornecedores":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo || ""}
                  onChange={(e) => handleChange("codigo", e.target.value)}
                  placeholder="Será gerado automaticamente"
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={formData.categoria || ""}
                  onValueChange={(value) => handleChange("categoria", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matéria Prima">Matéria Prima</SelectItem>
                    <SelectItem value="Produtos Químicos">Produtos Químicos</SelectItem>
                    <SelectItem value="Embalagens">Embalagens</SelectItem>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                    <SelectItem value="Combustíveis">Combustíveis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="nome">Nome/Razão Social *</Label>
              <Input
                id="nome"
                value={formData.nome || ""}
                onChange={(e) => handleChange("nome", e.target.value)}
                className={errors.nome ? "border-red-500" : ""}
              />
              {errors.nome && (
                <span className="text-red-500 text-sm">{errors.nome}</span>
              )}
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj || ""}
                onChange={(e) => handleChange("cnpj", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email}</span>
                )}
              </div>
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone || ""}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                  className={errors.telefone ? "border-red-500" : ""}
                />
                {errors.telefone && (
                  <span className="text-red-500 text-sm">{errors.telefone}</span>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco || ""}
                onChange={(e) => handleChange("endereco", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade || ""}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado || ""}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep || ""}
                  onChange={(e) => handleChange("cep", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="termosPagamento">Termos de Pagamento</Label>
              <Input
                id="termosPagamento"
                value={formData.termosPagamento || ""}
                onChange={(e) => handleChange("termosPagamento", e.target.value)}
                placeholder="Ex: 30/60/90 dias"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.ativo === false ? "inativo" : "ativo"}
                  onValueChange={(value) => handleChange("ativo", value === "ativo")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dataUltimaCompra">Última Compra</Label>
                <Input
                  id="dataUltimaCompra"
                  type="date"
                  value={formData.dataUltimaCompra || ""}
                  onChange={(e) => handleChange("dataUltimaCompra", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={formData.observacoes || ""}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                placeholder="Informações adicionais sobre o cliente"
              />
            </div>
          </>
        )

      case "transportadoras":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo || ""}
                  onChange={(e) => handleChange("codigo", e.target.value)}
                  placeholder="Será gerado automaticamente"
                />
              </div>
              <div>
                <Label htmlFor="modalidade">Modalidade</Label>
                <Select
                  value={formData.modalidade || ""}
                  onValueChange={(value) => handleChange("modalidade", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rodoviário">Rodoviário</SelectItem>
                    <SelectItem value="Ferroviário">Ferroviário</SelectItem>
                    <SelectItem value="Aquaviário">Aquaviário</SelectItem>
                    <SelectItem value="Aéreo">Aéreo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="nome">Nome/Razão Social *</Label>
              <Input
                id="nome"
                value={formData.nome || ""}
                onChange={(e) => handleChange("nome", e.target.value)}
                className={errors.nome ? "border-red-500" : ""}
              />
              {errors.nome && (
                <span className="text-red-500 text-sm">{errors.nome}</span>
              )}
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj || ""}
                onChange={(e) => handleChange("cnpj", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email}</span>
                )}
              </div>
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone || ""}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                  className={errors.telefone ? "border-red-500" : ""}
                />
                {errors.telefone && (
                  <span className="text-red-500 text-sm">{errors.telefone}</span>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco || ""}
                onChange={(e) => handleChange("endereco", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade || ""}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado || ""}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep || ""}
                  onChange={(e) => handleChange("cep", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="especialidade">Especialidade</Label>
              <Input
                id="especialidade"
                value={formData.especialidade || ""}
                onChange={(e) => handleChange("especialidade", e.target.value)}
                placeholder="Ex: Cargas Secas, Fertilizantes"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.ativo === false ? "inativo" : "ativo"}
                  onValueChange={(value) => handleChange("ativo", value === "ativo")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dataUltimaCompra">Última Compra</Label>
                <Input
                  id="dataUltimaCompra"
                  type="date"
                  value={formData.dataUltimaCompra || ""}
                  onChange={(e) => handleChange("dataUltimaCompra", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={formData.observacoes || ""}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                placeholder="Informações adicionais sobre o cliente"
              />
            </div>
          </>
        )

      case "produtos":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo || ""}
                  onChange={(e) => handleChange("codigo", e.target.value)}
                  placeholder="Será gerado automaticamente"
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo || ""}
                  onValueChange={(value) => {
                    handleChange("tipo", value)
                    handleChange("categoria", "") // Reset categoria quando tipo muda
                    handleChange("subcategoria", "") // Reset subcategoria
                    // Reset BOM se não for produto acabado
                    if (value !== "Produto Acabado") {
                      setBom([])
                    }
                  }}
                >
                  <SelectTrigger className={errors.tipo ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTipoOptions().map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <span className="text-red-500 text-sm">{errors.tipo}</span>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao || ""}
                onChange={(e) => handleChange("descricao", e.target.value)}
                className={errors.descricao ? "border-red-500" : ""}
              />
              {errors.descricao && (
                <span className="text-red-500 text-sm">{errors.descricao}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria || ""}
                  onValueChange={(value) => {
                    handleChange("categoria", value)
                    handleChange("subcategoria", "") // Reset subcategoria quando categoria muda
                  }}
                  disabled={!formData.tipo}
                >
                  <SelectTrigger className={errors.categoria ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategoriaOptions(formData.tipo).map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoria && (
                  <span className="text-red-500 text-sm">{errors.categoria}</span>
                )}
              </div>
              <div>
                <Label htmlFor="subcategoria">Subcategoria</Label>
                <Select
                  value={formData.subcategoria || ""}
                  onValueChange={(value) => handleChange("subcategoria", value)}
                  disabled={!formData.categoria}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a subcategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubcategoriaOptions(formData.categoria).map((subcategoria) => (
                      <SelectItem key={subcategoria} value={subcategoria}>
                        {subcategoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unidade">Unidade *</Label>
                <Select
                  value={formData.unidade || ""}
                  onValueChange={(value) => handleChange("unidade", value)}
                >
                  <SelectTrigger className={errors.unidade ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {getUnidadeOptions().map((unidade) => (
                      <SelectItem key={unidade} value={unidade}>
                        {unidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unidade && (
                  <span className="text-red-500 text-sm">{errors.unidade}</span>
                )}
              </div>
              <div>
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  value={formData.localizacao || ""}
                  onChange={(e) => handleChange("localizacao", e.target.value)}
                  placeholder="Ex: Galpão A - Setor 1"
                />
              </div>
            </div>

            {/* Campos específicos para produtos com fórmula */}
            {(formData.tipo === "Matéria Prima" || formData.tipo === "Produto Acabado") && (
              <div>
                <Label htmlFor="formula">Fórmula</Label>
                <Input
                  id="formula"
                  value={formData.formula || ""}
                  onChange={(e) => handleChange("formula", e.target.value)}
                  placeholder="Ex: 20-05-20"
                />
              </div>
            )}

            {/* BOM Manager para Produtos Acabados */}
            {formData.tipo === "Produto Acabado" && (
              <BOMManager
                bom={bom}
                setBom={setBom}
                materiasPrimas={materiasPrimas}
                errors={errors}
              />
            )}

            {/* Campos de custo e preço (não aplicável para alguns tipos) */}
            {!["Material Marketing"].includes(formData.tipo) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custo">
                    Custo (R$) *
                    {formData.tipo === "Produto Acabado" && (
                      <span className="text-sm text-blue-600 ml-2">
                        (Calculado automaticamente)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="custo"
                    type="number"
                    step="0.01"
                    value={formData.custo || ""}
                    onChange={(e) =>
                      handleChange("custo", Number.parseFloat(e.target.value) || 0)
                    }
                    className={errors.custo ? "border-red-500" : ""}
                    disabled={formData.tipo === "Produto Acabado"}
                  />
                  {errors.custo && (
                    <span className="text-red-500 text-sm">{errors.custo}</span>
                  )}
                </div>
                <div>
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco || ""}
                    onChange={(e) =>
                      handleChange("preco", Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            )}

            {/* Campos de estoque */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estoqueMin">Estoque Mínimo</Label>
                <Input
                  id="estoqueMin"
                  type="number"
                  value={formData.estoqueMin || ""}
                  onChange={(e) =>
                    handleChange("estoqueMin", Number.parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div>
                <Label htmlFor="estoqueAtual">Estoque Atual</Label>
                <Input
                  id="estoqueAtual"
                  type="number"
                  value={formData.estoqueAtual || ""}
                  onChange={(e) =>
                    handleChange("estoqueAtual", Number.parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            {/* Campos específicos por tipo */}
            {formData.tipo === "Matéria Prima" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pureza">Pureza (%)</Label>
                    <Input
                      id="pureza"
                      value={formData.pureza || ""}
                      onChange={(e) => handleChange("pureza", e.target.value)}
                      placeholder="Ex: 99.5%"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Input
                      id="fornecedor"
                      value={formData.fornecedor || ""}
                      onChange={(e) => handleChange("fornecedor", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lote">Lote</Label>
                    <Input
                      id="lote"
                      value={formData.lote || ""}
                      onChange={(e) => handleChange("lote", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataValidade">Data de Validade</Label>
                    <Input
                      id="dataValidade"
                      type="date"
                      value={formData.dataValidade || ""}
                      onChange={(e) => handleChange("dataValidade", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.tipo === "Produto Acabado" && (
              <>
                <div>
                  <Label htmlFor="composicao">Composição</Label>
                  <Input
                    id="composicao"
                    value={formData.composicao || ""}
                    onChange={(e) => handleChange("composicao", e.target.value)}
                    placeholder="Ex: Ureia + Superfosfato + Cloreto de Potássio"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bomId">BOM ID</Label>
                    <Input
                      id="bomId"
                      value={formData.bomId || ""}
                      onChange={(e) => handleChange("bomId", e.target.value)}
                      placeholder="Ex: BOM001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataProducao">Data de Produção</Label>
                    <Input
                      id="dataProducao"
                      type="date"
                      value={formData.dataProducao || ""}
                      onChange={(e) => handleChange("dataProducao", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.tipo === "Ativo" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numeroSerie">Número de Série</Label>
                    <Input
                      id="numeroSerie"
                      value={formData.numeroSerie || ""}
                      onChange={(e) => handleChange("numeroSerie", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataAquisicao">Data de Aquisição</Label>
                    <Input
                      id="dataAquisicao"
                      type="date"
                      value={formData.dataAquisicao || ""}
                      onChange={(e) => handleChange("dataAquisicao", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="garantia">Garantia</Label>
                  <Input
                    id="garantia"
                    value={formData.garantia || ""}
                    onChange={(e) => handleChange("garantia", e.target.value)}
                    placeholder="Ex: 24 meses"
                  />
                </div>
              </>
            )}

            {(formData.tipo === "Material Marketing" || formData.tipo === "Outros") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="especificacao">Especificação</Label>
                  <Input
                    id="especificacao"
                    value={formData.especificacao || ""}
                    onChange={(e) => handleChange("especificacao", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dimensoes">Dimensões</Label>
                  <Input
                    id="dimensoes"
                    value={formData.dimensoes || ""}
                    onChange={(e) => handleChange("dimensoes", e.target.value)}
                    placeholder="Ex: 90x60cm"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.ativo === false ? "inativo" : "ativo"}
                  onValueChange={(value) => handleChange("ativo", value === "ativo")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dataUltimaCompra">Última Compra</Label>
                <Input
                  id="dataUltimaCompra"
                  type="date"
                  value={formData.dataUltimaCompra || ""}
                  onChange={(e) => handleChange("dataUltimaCompra", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={formData.observacoes || ""}
                onChange={(e) => handleChange("observacoes", e.target.value)}
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-800">
            {item ? "Editar" : "Novo"} {type.slice(0, -1)}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderFormFields()}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CadastrosModule({ activeSection, setActiveSection }) {
  const { data, addItem, updateItem, deleteItem, searchItems } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)

  const exportToExcel = (dataType) => {
    const dataToExport = data[dataType] || []
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, dataType)
    XLSX.writeFile(wb, `${dataType}.xlsx`)

    toast({
      title: "Exportação concluída",
      description: `Relatório de ${dataType} exportado com sucesso.`,
    })
  }

  const handleAdd = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleView = (item) => {
    setViewingItem(item)
  }

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este item?")) {
      deleteItem(activeSection, id)
      toast({
        title: "Item excluído",
        description: "O item foi removido com sucesso.",
      })
    }
  }

  const handleSave = (formData) => {
    try {
      if (editingItem) {
        updateItem(activeSection, editingItem.id, { ...formData, ativo: true })
        toast({
          title: "Item atualizado",
          description: "O item foi atualizado com sucesso.",
        })
      } else {
        addItem(activeSection, { ...formData, ativo: true })
        toast({
          title: "Item criado",
          description: "O item foi criado com sucesso.",
        })
      }
      setShowForm(false)
      setEditingItem(null)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o item.",
        variant: "destructive",
      })
    }
  }

  const filteredData = searchItems(activeSection, searchTerm)

  const renderTable = () => {
    const columns = getColumnsForType(activeSection)

    return (
      <div className="data-table rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-gray-800"
                    >
                      {formatCellValue(item[column.key], column.type)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500 hover:text-blue-600"
                        onClick={() => handleView(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-yellow-500 hover:text-yellow-600"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const getColumnsForType = (type) => {
    const columnMap = {
      clientes: [
        { key: "codigo", label: "Código", type: "text" },
        { key: "nome", label: "Nome", type: "text" },
        { key: "tipo", label: "Tipo", type: "text" },
        { key: "email", label: "Email", type: "text" },
        { key: "telefone", label: "Telefone", type: "text" },
        { key: "cidade", label: "Cidade", type: "text" },
        { key: "faturamento", label: "Faturamento", type: "currency" },
      ],
      fornecedores: [
        { key: "codigo", label: "Código", type: "text" },
        { key: "nome", label: "Nome", type: "text" },
        { key: "categoria", label: "Categoria", type: "text" },
        { key: "email", label: "Email", type: "text" },
        { key: "telefone", label: "Telefone", type: "text" },
        { key: "cidade", label: "Cidade", type: "text" },
        { key: "termosPagamento", label: "Termos Pagamento", type: "text" },
      ],
      transportadoras: [
        { key: "codigo", label: "Código", type: "text" },
        { key: "nome", label: "Nome", type: "text" },
        { key: "modalidade", label: "Modalidade", type: "text" },
        { key: "especialidade", label: "Especialidade", type: "text" },
        { key: "telefone", label: "Telefone", type: "text" },
        { key: "cidade", label: "Cidade", type: "text" },
      ],
      produtos: [
        { key: "codigo", label: "Código", type: "text" },
        { key: "descricao", label: "Descrição", type: "text" },
        { key: "tipo", label: "Tipo", type: "text" },
        { key: "categoria", label: "Categoria", type: "text" },
        { key: "subcategoria", label: "Subcategoria", type: "text" },
        { key: "unidade", label: "Unidade", type: "text" },
        { key: "custo", label: "Custo", type: "currency" },
        { key: "preco", label: "Preço", type: "currency" },
        { key: "estoqueAtual", label: "Estoque", type: "number" },
        { key: "localizacao", label: "Localização", type: "text" },
      ],
    }
    return columnMap[type] || []
  }

  const formatCellValue = (value, type) => {
    if (value === null || value === undefined) return "-"

    switch (type) {
      case "currency":
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value)
      case "number":
        return new Intl.NumberFormat("pt-BR").format(value)
      default:
        return value
    }
  }

  const sectionTitle = {
    clientes: "Clientes",
    fornecedores: "Fornecedores",
    transportadoras: "Transportadoras",
    produtos: "Produtos",
  }[activeSection]

  const totalItems = filteredData.length
  const totalValue =
    activeSection === "clientes"
      ? filteredData.reduce((sum, item) => sum + (item.faturamento || 0), 0)
      : activeSection === "produtos"
        ? filteredData.reduce(
            (sum, item) => sum + (item.preco || 0) * (item.estoqueAtual || 0),
            0
          )
        : 0

  // Estatísticas específicas para produtos
  const produtoStats =
    activeSection === "produtos"
      ? {
          materiasPrimas: filteredData.filter((item) => item.tipo === "Matéria Prima").length,
          produtosAcabados: filteredData.filter((item) => item.tipo === "Produto Acabado").length,
          insumos: filteredData.filter((item) => item.tipo === "Insumo").length,
          ativos: filteredData.filter((item) => item.tipo === "Ativo").length,
          combustiveis: filteredData.filter((item) => item.tipo === "Combustível").length,
          estoqueAbaixoMinimo: filteredData.filter(
            (item) => item.estoqueAtual && item.estoqueMin && item.estoqueAtual < item.estoqueMin
          ).length,
        }
      : {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{sectionTitle}</h2>
          <p className="text-gray-500">Gestão de {sectionTitle.toLowerCase()}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => exportToExcel(activeSection)} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar XLSX
          </Button>
          <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo {activeSection.slice(0, -1)}
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de {sectionTitle}</p>
                <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                {activeSection === "clientes" && (
                  <Users className="h-6 w-6 text-blue-600" />
                )}
                {activeSection === "fornecedores" && (
                  <Building2 className="h-6 w-6 text-blue-600" />
                )}
                {activeSection === "transportadoras" && (
                  <Truck className="h-6 w-6 text-blue-600" />
                )}
                {activeSection === "produtos" && (
                  <Package className="h-6 w-6 text-blue-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {totalValue > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {activeSection === "clientes"
                      ? "Faturamento Total"
                      : "Valor em Estoque"}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCellValue(totalValue, "currency")}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredData.filter((item) => item.ativo !== false).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card específico para produtos */}
        {activeSection === "produtos" && produtoStats.estoqueAbaixoMinimo > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estoque Baixo</p>
                  <p className="text-2xl font-bold text-red-600">
                    {produtoStats.estoqueAbaixoMinimo}
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cards específicos para produtos por tipo */}
      {activeSection === "produtos" && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="bg-blue-50">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-blue-600 font-medium">Matérias Primas</p>
                <p className="text-lg font-bold text-blue-800">
                  {produtoStats.materiasPrimas}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-green-600 font-medium">Produtos Acabados</p>
                <p className="text-lg font-bold text-green-800">
                  {produtoStats.produtosAcabados}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-yellow-600 font-medium">Insumos</p>
                <p className="text-lg font-bold text-yellow-800">
                  {produtoStats.insumos}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-purple-600 font-medium">Ativos</p>
                <p className="text-lg font-bold text-purple-800">
                  {produtoStats.ativos}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-orange-600 font-medium">Combustíveis</p>
                <p className="text-lg font-bold text-orange-800">
                  {produtoStats.combustiveis}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-gray-600 font-medium">Outros</p>
                <p className="text-lg font-bold text-gray-800">
                  {totalItems -
                    produtoStats.materiasPrimas -
                    produtoStats.produtosAcabados -
                    produtoStats.insumos -
                    produtoStats.ativos -
                    produtoStats.combustiveis}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Buscar ${activeSection}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-800 capitalize">
            Lista de {activeSection} ({filteredData.length} {filteredData.length === 1 ? "item" : "itens"})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length > 0 ? (
            renderTable()
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm
                  ? "Nenhum resultado encontrado"
                  : `Nenhum ${activeSection.slice(0, -1)} cadastrado`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      {showForm && (
        <CadastroForm
          type={activeSection}
          item={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingItem(null)
          }}
        />
      )}

      {/* Modal de Visualização */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-800">
                Detalhes do {activeSection.slice(0, -1)}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setViewingItem(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(viewingItem).map(([key, value]) => {
                  if (key === "id" || key === "ativo") return null

                  // Renderização especial para BOM
                  if (key === "bom" && Array.isArray(value) && value.length > 0) {
                    return (
                      <div key={key} className="space-y-2">
                        <Label className="font-medium">
                          Lista de Materiais (BOM):
                        </Label>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {value.map((component, index) => {
                            const materiaPrima = data.produtos?.find(
                              (p) => p.id === component.materiaPrimaId
                            )
                            return (
                              <div
                                key={index}
                                className="flex justify-between items-center py-2 border-b last:border-b-0"
                              >
                                <span className="font-medium">
                                  {materiaPrima?.codigo} - {materiaPrima?.descricao}
                                </span>
                                <span className="text-gray-600">
                                  {component.quantidade} {component.unidade}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={key} className="grid grid-cols-3 gap-4">
                      <Label className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </Label>
                      <div className="col-span-2">
                        {key.includes("custo") ||
                        key.includes("preco") ||
                        key.includes("faturamento")
                          ? formatCellValue(value, "currency")
                          : key.includes("estoque")
                            ? formatCellValue(value, "number")
                            : value || "-"}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setViewingItem(null)}>
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setViewingItem(null)
                    handleEdit(viewingItem)
                  }}
                >
                  Editar
                </Button>
              </div>
            </CardContent>          </Card>
        </div>
      )}
    </div>
  )
}

CadastrosModule.Sidebar = CadastrosSidebar
CadastrosModule.defaultSection = "clientes"