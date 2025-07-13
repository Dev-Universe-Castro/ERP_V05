"use client"

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Plus, Search, Filter, Eye, Edit, Trash2, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  FileText, Download, Calendar, DollarSign, BarChart3,
  ArrowUpDown, Warehouse, ShoppingCart, Factory, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useEstoque } from '@/hooks/useEstoque';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useWorkflow } from '@/hooks/useWorkflow';
import EstoqueSidebar from './estoque/EstoqueSidebar';
import CompliancePanel from '../common/CompliancePanel';
import WorkflowSteps from '../common/WorkflowSteps';
import * as XLSX from 'xlsx';

const EstoqueStats = ({ produtos, movimentacoes }) => {
  const stats = useMemo(() => {
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    const produtosAtivos = produtos.filter(p => p.ativo !== false)
    const produtosEstoqueBaixo = produtos.filter(p => 
      p.estoqueAtual !== undefined && p.estoqueMin !== undefined &&
      p.estoqueAtual < p.estoqueMin
    )

    const valorTotalEstoque = produtos.reduce((total, produto) => {
      const valorUnitario = produto.custoMedio || produto.custo || produto.preco || 0
      const quantidade = produto.estoqueAtual || 0
      return total + (valorUnitario * quantidade)
    }, 0)

    const movimentacoesMes = movimentacoes.filter(mov => 
      new Date(mov.data) >= inicioMes
    )

    const entradasMes = movimentacoesMes.filter(m => m.tipo === 'entrada').length
    const saidasMes = movimentacoesMes.filter(m => m.tipo === 'saida').length

    return {
      totalProdutos: produtos.length,
      produtosAtivos: produtosAtivos.length,
      produtosEstoqueBaixo: produtosEstoqueBaixo.length,
      valorTotalEstoque,
      movimentacoesMes: movimentacoesMes.length,
      entradasMes,
      saidasMes
    }
  }, [produtos, movimentacoes])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Produtos em Estoque</p>
              <p className="text-2xl font-bold text-gray-800">{stats.produtosAtivos}</p>
              <p className="text-xs text-gray-500">de {stats.totalProdutos} cadastrados</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Estoque Baixo</p>
              <p className="text-2xl font-bold text-red-600">{stats.produtosEstoqueBaixo}</p>
              <p className="text-xs text-gray-500">necessitam reposição</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valor do Estoque</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {stats.valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Movimentações (Mês)</p>
              <p className="text-2xl font-bold text-purple-600">{stats.movimentacoesMes}</p>
              <p className="text-xs text-gray-500">
                {stats.entradasMes} entradas | {stats.saidasMes} saídas
              </p>
            </div>
            <ArrowUpDown className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const ProdutosTable = ({ produtos, onEdit, onDelete, onView }) => (
  <div className="data-table rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Código</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Produto</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Estoque Atual</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Estoque Mín.</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Unit.</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Total</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {produtos.map((produto, index) => {
            const estoqueAtual = produto.estoqueAtual || 0
            const estoqueMin = produto.estoqueMin || 0
            const valorUnitario = produto.custoMedio || produto.custo || produto.preco || 0
            const valorTotal = estoqueAtual * valorUnitario
            const statusEstoque = estoqueAtual < estoqueMin ? 'baixo' : estoqueAtual === 0 ? 'zerado' : 'normal'

            return (
              <motion.tr
                key={produto.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-sm text-gray-800 font-mono">{produto.codigo}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{produto.nome}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{produto.tipo}</td>
                <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">
                  {estoqueAtual.toLocaleString('pt-BR')} {produto.unidade}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {estoqueMin.toLocaleString('pt-BR')} {produto.unidade}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  R$ {valorUnitario.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">
                  R$ {valorTotal.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    statusEstoque === 'zerado' ? 'bg-red-100 text-red-800' :
                    statusEstoque === 'baixo' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {statusEstoque === 'zerado' ? 'Zerado' :
                     statusEstoque === 'baixo' ? 'Baixo' : 'Normal'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(produto)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(produto)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(produto)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </div>
)

const MovimentacoesTable = ({ movimentacoes, onEdit, onDelete, onView }) => (
  <div className="data-table rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Produto</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Quantidade</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Unit.</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Total</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Documento</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Usuário</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {movimentacoes.map((mov, index) => (
            <motion.tr
              key={mov.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm text-gray-800">
                {new Date(mov.data).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">
                <div>
                  <p className="font-medium">{mov.produto}</p>
                  <p className="text-xs text-gray-500">{mov.codigo}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center space-x-2">
                  {mov.tipo === 'entrada' ? 
                    <TrendingUp className="h-4 w-4 text-green-500" /> :
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  }
                  <span className={mov.tipo === 'entrada' ? 'text-green-700' : 'text-red-700'}>
                    {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                  {mov.subTipo && (
                    <Badge variant="outline" className="text-xs">
                      {mov.subTipo}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">
                {mov.quantidade > 0 ? '+' : ''}{mov.quantidade.toLocaleString('pt-BR')} {mov.unidade}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 text-right">
                R$ {(mov.valorUnitario || 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">
                R$ {(mov.valorTotal || 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{mov.documento || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{mov.usuario || '-'}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onView(mov)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {mov.subTipo === 'manual' && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(mov)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(mov)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const SaidaManualModal = ({ isOpen, onClose, onSave, produtos }) => {
  const [formData, setFormData] = useState({
    produtoId: '',
    quantidade: '',
    motivo: '',
    documento: '',
    observacao: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.produtoId || !formData.quantidade || !formData.motivo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      })
      return
    }

    onSave({
      ...formData,
      produtoId: parseInt(formData.produtoId),
      quantidade: parseFloat(formData.quantidade),
      usuario: 'Usuário Atual' // TODO: Pegar do contexto de auth
    })

    setFormData({
      produtoId: '',
      quantidade: '',
      motivo: '',
      documento: '',
      observacao: ''
    })
  }

  if (!isOpen) return null

  const produtoSelecionado = produtos.find(p => p.id === parseInt(formData.produtoId))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Saída Manual de Estoque</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="produto">Produto *</Label>
              <Select value={formData.produtoId} onValueChange={(value) => setFormData({...formData, produtoId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.filter(p => p.ativo !== false && (p.estoqueAtual || 0) > 0).map(produto => (
                    <SelectItem key={produto.id} value={produto.id.toString()}>
                      {produto.codigo} - {produto.nome} (Estoque: {produto.estoqueAtual || 0} {produto.unidade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {produtoSelecionado && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Estoque atual:</strong> {produtoSelecionado.estoqueAtual || 0} {produtoSelecionado.unidade}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="quantidade">Quantidade a Retirar *</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.01"
                value={formData.quantidade}
                onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                placeholder="Quantidade"
                max={produtoSelecionado?.estoqueAtual || 0}
                required
              />
            </div>

            <div>
              <Label htmlFor="motivo">Motivo da Saída *</Label>
              <Select value={formData.motivo} onValueChange={(value) => setFormData({...formData, motivo: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumo_interno">Consumo Interno</SelectItem>
                  <SelectItem value="amostra">Amostra</SelectItem>
                  <SelectItem value="perda">Perda/Avaria</SelectItem>
                  <SelectItem value="doacao">Doação</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="descarte">Descarte</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="documento">Documento de Referência</Label>
              <Input
                id="documento"
                value={formData.documento}
                onChange={(e) => setFormData({...formData, documento: e.target.value})}
                placeholder="Número do documento, nota, etc."
              />
            </div>

            <div>
              <Label htmlFor="observacao">Observações</Label>
              <Input
                id="observacao"
                value={formData.observacao}
                onChange={(e) => setFormData({...formData, observacao: e.target.value})}
                placeholder="Observações adicionais"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                Confirmar Saída
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

const InventarioModal = ({ isOpen, onClose, onSave, produtos }) => {
  const [formData, setFormData] = useState({
    descricao: '',
    dataInventario: new Date().toISOString().split('T')[0],
    responsavel: '',
    observacoes: ''
  })

  const [selectedProducts, setSelectedProducts] = useState([])

  const handleAddProduct = (produtoId) => {
    const produto = produtos.find(p => p.id === parseInt(produtoId))
    if (produto && !selectedProducts.find(p => p.id === produto.id)) {
      const newItem = {
        ...produto,
        quantidadeContada: produto.estoqueAtual || 0,
        diferenca: 0
      }
      setSelectedProducts([...selectedProducts, newItem])
    }
  }

  const updateQuantidadeContada = (produtoId, quantidade) => {
    setSelectedProducts(prev => prev.map(item => {
      if (item.id === produtoId) {
        const diferenca = quantidade - (item.estoqueAtual || 0)
        return { ...item, quantidadeContada: quantidade, diferenca }
      }
      return item
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.descricao || selectedProducts.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a descrição e adicione pelo menos um produto.",
        variant: "destructive"
      })
      return
    }

    const inventario = {
      ...formData,
      itens: selectedProducts,
      status: 'pendente',
      dataCriacao: new Date().toISOString()
    }

    onSave(inventario)
    onClose()

    // Reset form
    setFormData({
      descricao: '',
      dataInventario: new Date().toISOString().split('T')[0],
      responsavel: '',
      observacoes: ''
    })
    setSelectedProducts([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Novo Inventário</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Inventário Geral Janeiro 2024"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dataInventario">Data do Inventário *</Label>
                <Input
                  id="dataInventario"
                  type="date"
                  value={formData.dataInventario}
                  onChange={(e) => setFormData({ ...formData, dataInventario: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações sobre o inventário"
              />
            </div>

            <div>
              <Label>Adicionar Produtos ao Inventário</Label>
              <Select onValueChange={(value) => handleAddProduct(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto para adicionar" />
                </SelectTrigger>
                <SelectContent>
                  {produtos
                    .filter(p => p.ativo !== false && !selectedProducts.find(sp => sp.id === p.id))
                    .map(produto => (
                      <SelectItem key={produto.id} value={produto.id.toString()}>
                        {produto.codigo} - {produto.nome} (Estoque: {produto.estoqueAtual || 0})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProducts.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold">Produtos Selecionados ({selectedProducts.length})</h4>
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Produto</th>
                        <th className="px-3 py-2 text-right text-sm font-medium text-gray-500">Estoque Sistema</th>
                        <th className="px-3 py-2 text-right text-sm font-medium text-gray-500">Quantidade Contada</th>
                        <th className="px-3 py-2 text-right text-sm font-medium text-gray-500">Diferença</th>
                        <th className="px-3 py-2 text-center text-sm font-medium text-gray-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedProducts.map(item => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 text-sm">
                            <div>
                              <p className="font-medium">{item.nome}</p>
                              <p className="text-xs text-gray-500">{item.codigo}</p>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-right">
                            {(item.estoqueAtual || 0).toLocaleString('pt-BR')} {item.unidade}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            <Input
                              type="number"
                              step="0.01"
                              value={item.quantidadeContada}
                              onChange={(e) => updateQuantidadeContada(item.id, parseFloat(e.target.value) || 0)}
                              className="w-20 text-right"
                            />
                          </td>
                          <td className="px-3 py-2 text-sm text-right">
                            <span className={`font-semibold ${
                              item.diferenca > 0 ? 'text-green-600' :
                              item.diferenca < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {item.diferenca > 0 ? '+' : ''}{item.diferenca.toLocaleString('pt-BR')}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedProducts(prev => prev.filter(p => p.id !== item.id))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={selectedProducts.length === 0}>
                Salvar Inventário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Regras de compliance para estoque
const complianceRules = [
  {
    id: 'stock_accuracy',
    name: 'Precisão do Estoque',
    description: 'Inventários regulares e controle de divergências',
    category: 'Controle'
  },
  {
    id: 'stock_valuation',
    name: 'Valoração do Estoque',
    description: 'Métodos consistentes de valoração',
    category: 'Financeiro'
  },
  {
    id: 'movement_traceability',
    name: 'Rastreabilidade de Movimentações',
    description: 'Registro completo de todas as movimentações',
    category: 'Auditoria'
  },
  {
    id: 'minimum_stock',
    name: 'Controle de Estoque Mínimo',
    description: 'Monitoramento e alertas de reposição',
    category: 'Operacional'
  }
]

export default function EstoqueModule({ activeSection, onSectionChange }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showSaidaModal, setShowSaidaModal] = useState(false)
  const [showInventarioModal, setShowInventarioModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(false)

  const estoque = useEstoque()
  const { logAction } = useAuditLog()
  const { executeWorkflow, getActiveWorkflows } = useWorkflow()
  const { searchItems } = useData()

  // Buscar dados
  const produtos = estoque.produtos.getAll()
  const movimentacoes = estoque.movimentacoes.getAll()
  const inventarios = estoque.inventarios.getAll()

  const filteredProdutos = useMemo(() => produtos.filter(produto => {
    const matchesSearch = Object.values(produto).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )

    const matchesFilter = filterType === 'all' ||
      (filterType === 'baixo' && (produto.estoqueAtual || 0) < (produto.estoqueMin || 0)) ||
      (filterType === 'zerado' && (produto.estoqueAtual || 0) === 0) ||
      (filterType === 'normal' && (produto.estoqueAtual || 0) >= (produto.estoqueMin || 0))

    return matchesSearch && matchesFilter
  }), [produtos, searchTerm, filterType])

  const filteredMovimentacoes = useMemo(() => movimentacoes
    .filter(mov => Object.values(mov).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ))
    .sort((a, b) => new Date(b.data) - new Date(a.data))
  , [movimentacoes, searchTerm])

  const handleSaidaManual = async (dados) => {
    try {
      setLoading(true)
      await estoque.criarSaidaManual(dados)
      setShowSaidaModal(false)
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setLoading(false)
    }
  }

  const handleNovoInventario = async (dados) => {
    try {
      setLoading(true)
      await estoque.criarInventario(dados)
      setShowInventarioModal(false)
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    let dataToExport, filename

    if (activeSection === 'produtos') {
      dataToExport = produtos.map(produto => ({
        Código: produto.codigo,
        Nome: produto.nome,
        Tipo: produto.tipo,
        'Estoque Atual': produto.estoqueAtual || 0,
        Unidade: produto.unidade,
        'Estoque Mínimo': produto.estoqueMin || 0,
        'Valor Unitário': produto.custoMedio || produto.custo || produto.preco || 0,
        'Valor Total': (produto.estoqueAtual || 0) * (produto.custoMedio || produto.custo || produto.preco || 0)
      }))
      filename = `estoque_produtos_${new Date().toISOString().split('T')[0]}.xlsx`
    } else {
      dataToExport = movimentacoes.map(mov => ({
        Data: new Date(mov.data).toLocaleDateString('pt-BR'),
        Código: mov.codigo,
        Produto: mov.produto,
        Tipo: mov.tipo,
        'Sub Tipo': mov.subTipo || '',
        Quantidade: mov.quantidade,
        Unidade: mov.unidade,
        'Valor Unitário': mov.valorUnitario || 0,
        'Valor Total': mov.valorTotal || 0,
        Documento: mov.documento || '',
        Usuário: mov.usuario || '',
        Observação: mov.observacao || ''
      }))
      filename = `movimentacoes_estoque_${new Date().toISOString().split('T')[0]}.xlsx`
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, activeSection)
    XLSX.writeFile(wb, filename)

    toast({
      title: "Exportação concluída",
      description: `Relatório de ${activeSection} exportado com sucesso.`
    })
  }

  const sections = [
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'movimentacoes', label: 'Movimentações', icon: ArrowUpDown },
    { id: 'inventarios', label: 'Inventários', icon: BarChart3 }
  ]

  const sectionTitle = {
    produtos: 'Produtos em Estoque',
    movimentacoes: 'Movimentações de Estoque',
    inventarios: 'Inventários'
  }[activeSection]

  const renderContent = () => {
    switch (activeSection) {
      case 'produtos':
        return filteredProdutos.length > 0 ? (
          <ProdutosTable 
            produtos={filteredProdutos}
            onEdit={() => {}} // TODO: Implementar edição
            onDelete={() => {}} // TODO: Implementar exclusão
            onView={() => {}} // TODO: Implementar visualização
          />
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </p>
          </div>
        )

      case 'movimentacoes':
        return filteredMovimentacoes.length > 0 ? (
          <MovimentacoesTable 
            movimentacoes={filteredMovimentacoes}
            onEdit={() => {}} // TODO: Implementar edição
            onDelete={() => {}} // TODO: Implementar exclusão
            onView={() => {}} // TODO: Implementar visualização
          />
        ) : (
          <div className="text-center py-12">
            <ArrowUpDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhuma movimentação encontrada' : 'Nenhuma movimentação registrada'}
            </p>
          </div>
        )

      default:
        return <ProdutosTable produtos={filteredProdutos} onEdit={() => {}} onDelete={() => {}} onView={() => {}} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{sectionTitle}</h2>
          <p className="text-gray-500">Controle completo de estoque integrado</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={exportToExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar XLSX
          </Button>

          {activeSection === 'movimentacoes' && (
            <Button onClick={() => setShowSaidaModal(true)} variant="outline" className="text-red-600">
              <TrendingDown className="h-4 w-4 mr-2" />
              Saída Manual
            </Button>
          )}

          {activeSection === 'inventarios' && (
            <Button onClick={() => setShowInventarioModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Inventário
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <EstoqueStats produtos={produtos} movimentacoes={movimentacoes} />

      {/* Painel de Compliance */}
      <CompliancePanel rules={complianceRules} data={{ produtos, movimentacoes, inventarios }} />

      {/* Workflows Ativos */}
      <WorkflowSteps 
        activeWorkflows={getActiveWorkflows('estoque')}
        onExecuteStep={(workflowId, stepId, data) => executeWorkflow(workflowId, data)}
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Buscar ${activeSection}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {activeSection === 'produtos' && (
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os produtos</SelectItem>
              <SelectItem value="normal">Estoque normal</SelectItem>
              <SelectItem value="baixo">Estoque baixo</SelectItem>
              <SelectItem value="zerado">Estoque zerado</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Conteúdo Principal */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-800">{sectionTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      {/* Modais */}
      <SaidaManualModal
        isOpen={showSaidaModal}
        onClose={() => setShowSaidaModal(false)}
        onSave={handleSaidaManual}
        produtos={produtos}
      />

      <InventarioModal
        isOpen={showInventarioModal}
        onClose={() => setShowInventarioModal(false)}
        onSave={handleNovoInventario}
        produtos={produtos}
      />
    </div>
  )
}

EstoqueModule.Sidebar = EstoqueSidebar
EstoqueModule.defaultSection = 'produtos'