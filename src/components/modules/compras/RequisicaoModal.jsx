import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';

const RequisicaoModal = ({ isOpen, onClose, requisicao }) => {
  const { data, addItem, updateItem, generateNumber } = useData();
  const [formData, setFormData] = useState({
    numero: '',
    solicitante: '',
    departamento: '',
    dataRequisicao: new Date().toISOString().split('T')[0],
    dataNecessidade: '',
    prioridade: 'media',
    observacoes: '',
    itens: []
  });

  const produtos = data.produtos || [];

  useEffect(() => {
    if (requisicao) {
      setFormData({
        ...requisicao,
        dataRequisicao: new Date(requisicao.dataRequisicao).toISOString().split('T')[0],
        dataNecessidade: new Date(requisicao.dataNecessidade).toISOString().split('T')[0],
      });
    } else {
      setFormData(prev => ({
        ...prev,
        numero: generateNumber('REQ', 'requisicoes')
      }));
    }
  }, [requisicao, generateNumber]);

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      itens: [
        ...prev.itens,
        {
          id: Date.now(),
          produtoId: null,
          quantidade: 0,
          unidade: 'UN',
          justificativa: ''
        }
      ]
    }));
  };

  const handleRemoveItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.id !== itemId)
    }));
  };

  const handleItemChange = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requisicaoData = {
      ...formData,
      id: requisicao?.id || Date.now(),
      dataRequisicao: new Date(formData.dataRequisicao).toISOString(),
      dataNecessidade: new Date(formData.dataNecessidade).toISOString(),
      status: requisicao?.status || 'pendente'
    };

    if (requisicao) {
      updateItem('requisicoes', requisicao.id, requisicaoData);
      toast({
        title: "Requisição atualizada",
        description: `Requisição ${formData.numero} atualizada com sucesso.`,
      });
    } else {
      addItem('requisicoes', requisicaoData);
      toast({
        title: "Requisição criada",
        description: `Requisição ${formData.numero} criada com sucesso.`,
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
            {requisicao ? 'Editar Requisição' : 'Nova Requisição'}
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
                onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="solicitante">Solicitante</Label>
              <Input
                id="solicitante"
                value={formData.solicitante}
                onChange={(e) => setFormData(prev => ({ ...prev, solicitante: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="departamento">Departamento</Label>
              <Input
                id="departamento"
                value={formData.departamento}
                onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="prioridade">Prioridade</Label>
              <select
                id="prioridade"
                value={formData.prioridade}
                onChange={(e) => setFormData(prev => ({ ...prev, prioridade: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <Label htmlFor="dataRequisicao">Data Requisição</Label>
              <Input
                id="dataRequisicao"
                type="date"
                value={formData.dataRequisicao}
                onChange={(e) => setFormData(prev => ({ ...prev, dataRequisicao: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="dataNecessidade">Data Necessidade</Label>
              <Input
                id="dataNecessidade"
                type="date"
                value={formData.dataNecessidade}
                onChange={(e) => setFormData(prev => ({ ...prev, dataNecessidade: e.target.value }))}
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
              <Label>Itens da Requisição</Label>
              <Button type="button" onClick={handleAddItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.itens.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        onChange={(e) => handleItemChange(item.id, 'quantidade', parseFloat(e.target.value))}
                        required
                      />
                    </div>
                    <div>
                      <Label>Unidade</Label>
                      <select
                        value={item.unidade}
                        onChange={(e) => handleItemChange(item.id, 'unidade', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="UN">Unidade</option>
                        <option value="KG">Quilograma</option>
                        <option value="TON">Tonelada</option>
                        <option value="L">Litro</option>
                        <option value="M">Metro</option>
                        <option value="M2">Metro²</option>
                        <option value="M3">Metro³</option>
                      </select>
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
                  <div className="mt-4">
                    <Label>Justificativa</Label>
                    <Input
                      value={item.justificativa}
                      onChange={(e) => handleItemChange(item.id, 'justificativa', e.target.value)}
                      placeholder="Justificativa para solicitação do item"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {requisicao ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequisicaoModal;