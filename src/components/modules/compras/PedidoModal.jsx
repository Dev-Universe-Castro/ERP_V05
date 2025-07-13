import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';

const PedidoModal = ({ isOpen, onClose, pedido }) => {
  const { data, addItem, updateItem, generateNumber } = useData();
  const [formData, setFormData] = useState({
    numero: '',
    fornecedorId: null,
    dataEmissao: new Date().toISOString().split('T')[0],
    dataPrevisao: '',
    observacoes: '',
    status: 'enviado',
    itens: [],
    valorTotal: 0
  });

  const fornecedores = data.fornecedores || [];
  const produtos = data.produtos || [];

  useEffect(() => {
    if (pedido) {
      setFormData({
        ...pedido,
        dataEmissao: new Date(pedido.dataEmissao).toISOString().split('T')[0],
        dataPrevisao: new Date(pedido.dataPrevisao).toISOString().split('T')[0],
      });
    } else {
      setFormData(prev => ({
        ...prev,
        numero: generateNumber('PED', 'pedidos')
      }));
    }
  }, [pedido, generateNumber]);

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      itens: [
        ...prev.itens,
        {
          id: Date.now(),
          produtoId: null,
          quantidade: 0,
          valorUnitario: 0,
          valorTotal: 0
        }
      ]
    }));
  };

  const handleRemoveItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.id !== itemId)
    }));
    calculateTotal();
  };

  const handleItemChange = (itemId, field, value) => {
    setFormData(prev => {
      const newItens = prev.itens.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantidade' || field === 'valorUnitario') {
            updatedItem.valorTotal = updatedItem.quantidade * updatedItem.valorUnitario;
          }
          return updatedItem;
        }
        return item;
      });

      const valorTotal = newItens.reduce((total, item) => total + item.valorTotal, 0);

      return {
        ...prev,
        itens: newItens,
        valorTotal
      };
    });
  };

  const calculateTotal = () => {
    const total = formData.itens.reduce((sum, item) => sum + item.valorTotal, 0);
    setFormData(prev => ({ ...prev, valorTotal: total }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const pedidoData = {
      ...formData,
      id: pedido?.id || Date.now(),
      dataEmissao: new Date(formData.dataEmissao).toISOString(),
      dataPrevisao: new Date(formData.dataPrevisao).toISOString(),
    };

    if (pedido) {
      updateItem('pedidos', pedido.id, pedidoData);
      toast({
        title: "Pedido atualizado",
        description: `Pedido ${formData.numero} atualizado com sucesso.`,
      });
    } else {
      addItem('pedidos', pedidoData);
      toast({
        title: "Pedido criado",
        description: `Pedido ${formData.numero} criado com sucesso.`,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {pedido ? 'Editar Pedido' : 'Novo Pedido'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={formData.numero}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <select
                id="fornecedor"
                value={formData.fornecedorId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, fornecedorId: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecione...</option>
                {fornecedores.map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="dataEmissao">Data Emissão</Label>
              <Input
                id="dataEmissao"
                type="date"
                value={formData.dataEmissao}
                onChange={(e) => setFormData(prev => ({ ...prev, dataEmissao: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="dataPrevisao">Data Previsão</Label>
              <Input
                id="dataPrevisao"
                type="date"
                value={formData.dataPrevisao}
                onChange={(e) => setFormData(prev => ({ ...prev, dataPrevisao: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          {/* Itens */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Itens do Pedido</Label>
              <Button type="button" onClick={handleAddItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.itens.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label>Produto</Label>
                      <select
                        value={item.produtoId || ''}
                        onChange={(e) => handleItemChange(item.id, 'produtoId', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Selecione...</option>
                        {produtos.map((produto) => (
                          <option key={produto.id} value={produto.id}>
                            {produto.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(item.id, 'quantidade', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Valor Unitário</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.valorUnitario}
                        onChange={(e) => handleItemChange(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Valor Total</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.valorTotal}
                        disabled
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Valor Total do Pedido:</span>
                <span className="text-lg font-bold">
                  R$ {formData.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {pedido ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PedidoModal;