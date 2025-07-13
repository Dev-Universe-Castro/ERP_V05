
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const FolhaModal = ({ folha, onClose }) => {
  const { funcionarios, addItem, updateItem } = useData();
  const [formData, setFormData] = useState({
    funcionarioId: '',
    periodo: new Date().toISOString().slice(0, 7),
    salarioBase: '',
    horasExtras: '',
    beneficios: '',
    descontos: '',
    salarioLiquido: '',
    status: 'Pendente'
  });

  useEffect(() => {
    if (folha) {
      setFormData(folha);
    }
  }, [folha]);

  useEffect(() => {
    // Calcular salário líquido automaticamente
    const base = parseFloat(formData.salarioBase) || 0;
    const extras = parseFloat(formData.horasExtras) || 0;
    const beneficios = parseFloat(formData.beneficios) || 0;
    const descontos = parseFloat(formData.descontos) || 0;
    
    const liquido = base + extras + beneficios - descontos;
    setFormData(prev => ({ ...prev, salarioLiquido: liquido.toFixed(2) }));
  }, [formData.salarioBase, formData.horasExtras, formData.beneficios, formData.descontos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const folhaData = {
      ...formData,
      salarioBase: parseFloat(formData.salarioBase) || 0,
      horasExtras: parseFloat(formData.horasExtras) || 0,
      beneficios: parseFloat(formData.beneficios) || 0,
      descontos: parseFloat(formData.descontos) || 0,
      salarioLiquido: parseFloat(formData.salarioLiquido) || 0,
      id: folha?.id || Date.now()
    };

    if (folha) {
      updateItem('folhasPagamento', folhaData);
    } else {
      addItem('folhasPagamento', folhaData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {folha ? 'Editar Folha' : 'Nova Folha de Pagamento'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="funcionarioId">Funcionário *</Label>
            <Select value={formData.funcionarioId} onValueChange={(value) => setFormData({ ...formData, funcionarioId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o funcionário" />
              </SelectTrigger>
              <SelectContent>
                {funcionarios?.map((funcionario) => (
                  <SelectItem key={funcionario.id} value={funcionario.id.toString()}>
                    {funcionario.nome} - {funcionario.cargo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="periodo">Período *</Label>
            <Input
              id="periodo"
              type="month"
              value={formData.periodo}
              onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="salarioBase">Salário Base *</Label>
            <Input
              id="salarioBase"
              type="number"
              step="0.01"
              value={formData.salarioBase}
              onChange={(e) => setFormData({ ...formData, salarioBase: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="horasExtras">Horas Extras</Label>
            <Input
              id="horasExtras"
              type="number"
              step="0.01"
              value={formData.horasExtras}
              onChange={(e) => setFormData({ ...formData, horasExtras: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="beneficios">Benefícios</Label>
            <Input
              id="beneficios"
              type="number"
              step="0.01"
              value={formData.beneficios}
              onChange={(e) => setFormData({ ...formData, beneficios: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="descontos">Descontos</Label>
            <Input
              id="descontos"
              type="number"
              step="0.01"
              value={formData.descontos}
              onChange={(e) => setFormData({ ...formData, descontos: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="salarioLiquido">Salário Líquido</Label>
            <Input
              id="salarioLiquido"
              type="number"
              step="0.01"
              value={formData.salarioLiquido}
              readOnly
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Calculada">Calculada</SelectItem>
                <SelectItem value="Paga">Paga</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {folha ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolhaModal;
