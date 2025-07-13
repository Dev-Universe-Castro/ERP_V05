
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';

const OrdemProducaoModal = ({ ordem, onClose }) => {
  const { addOrdemProducao, updateOrdemProducao, produtos, usuarios } = useData();
  const [formData, setFormData] = useState({
    numero: '',
    produto: '',
    quantidade: '',
    dataInicio: '',
    dataPrevisao: '',
    responsavel: '',
    prioridade: 'Média',
    status: 'Planejada',
    observacoes: ''
  });

  useEffect(() => {
    if (ordem) {
      setFormData(ordem);
    } else {
      // Gerar número automático
      setFormData(prev => ({
        ...prev,
        numero: `OP${Date.now().toString().slice(-6)}`
      }));
    }
  }, [ordem]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.produto || !formData.quantidade || !formData.responsavel) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const ordemData = {
      ...formData,
      id: ordem?.id || Date.now(),
      produzido: ordem?.produzido || 0,
      dataCriacao: ordem?.dataCriacao || new Date().toISOString().split('T')[0]
    };

    if (ordem) {
      updateOrdemProducao(ordemData);
      toast({
        title: "Sucesso",
        description: "Ordem de produção atualizada com sucesso!",
      });
    } else {
      addOrdemProducao(ordemData);
      toast({
        title: "Sucesso",
        description: "Ordem de produção criada com sucesso!",
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {ordem ? 'Editar Ordem de Produção' : 'Nova Ordem de Produção'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero">Número da OP</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select value={formData.prioridade} onValueChange={(value) => handleInputChange('prioridade', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="produto">Produto</Label>
            <Select value={formData.produto} onValueChange={(value) => handleInputChange('produto', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                {produtos?.map((produto) => (
                  <SelectItem key={produto.id} value={produto.nome}>
                    {produto.nome}
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                value={formData.quantidade}
                onChange={(e) => handleInputChange('quantidade', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="responsavel">Responsável</Label>
              <Select value={formData.responsavel} onValueChange={(value) => handleInputChange('responsavel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios?.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.nome}>
                      {usuario.nome}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="dataPrevisao">Data Prevista</Label>
              <Input
                id="dataPrevisao"
                type="date"
                value={formData.dataPrevisao}
                onChange={(e) => handleInputChange('dataPrevisao', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planejada">Planejada</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Pausada">Pausada</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {ordem ? 'Atualizar' : 'Criar'} Ordem
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrdemProducaoModal;
