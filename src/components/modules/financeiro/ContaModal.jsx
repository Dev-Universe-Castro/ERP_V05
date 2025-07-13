
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, CreditCard } from 'lucide-react';

const ContaModal = ({ isOpen, onClose, conta, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    banco: '',
    agencia: '',
    conta: '',
    tipo: 'corrente',
    saldo: 0,
    status: 'ativa',
    observacoes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (conta) {
      setFormData({
        nome: conta.nome || '',
        banco: conta.banco || '',
        agencia: conta.agencia || '',
        conta: conta.conta || '',
        tipo: conta.tipo || 'corrente',
        saldo: conta.saldo || 0,
        status: conta.status || 'ativa',
        observacoes: conta.observacoes || ''
      });
    } else {
      setFormData({
        nome: '',
        banco: '',
        agencia: '',
        conta: '',
        tipo: 'corrente',
        saldo: 0,
        status: 'ativa',
        observacoes: ''
      });
    }
    setErrors({});
  }, [conta, isOpen]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.banco.trim()) {
      newErrors.banco = 'Banco é obrigatório';
    }
    
    if (!formData.agencia.trim()) {
      newErrors.agencia = 'Agência é obrigatória';
    }
    
    if (!formData.conta.trim()) {
      newErrors.conta = 'Conta é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    const dadosConta = {
      ...formData,
      saldo: parseFloat(formData.saldo) || 0,
      ultimaMovimentacao: new Date().toISOString()
    };

    onSave(dadosConta);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {conta ? 'Editar Conta' : 'Nova Conta'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Conta *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Conta Corrente Principal"
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
            </div>

            <div>
              <Label htmlFor="banco">Banco *</Label>
              <Input
                id="banco"
                value={formData.banco}
                onChange={(e) => handleChange('banco', e.target.value)}
                placeholder="Ex: Banco do Brasil"
                className={errors.banco ? 'border-red-500' : ''}
              />
              {errors.banco && <p className="text-red-500 text-sm mt-1">{errors.banco}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agencia">Agência *</Label>
                <Input
                  id="agencia"
                  value={formData.agencia}
                  onChange={(e) => handleChange('agencia', e.target.value)}
                  placeholder="1234-5"
                  className={errors.agencia ? 'border-red-500' : ''}
                />
                {errors.agencia && <p className="text-red-500 text-sm mt-1">{errors.agencia}</p>}
              </div>

              <div>
                <Label htmlFor="conta">Conta *</Label>
                <Input
                  id="conta"
                  value={formData.conta}
                  onChange={(e) => handleChange('conta', e.target.value)}
                  placeholder="67890-1"
                  className={errors.conta ? 'border-red-500' : ''}
                />
                {errors.conta && <p className="text-red-500 text-sm mt-1">{errors.conta}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo">Tipo de Conta</Label>
                <Select value={formData.tipo} onValueChange={(value) => handleChange('tipo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrente">Conta Corrente</SelectItem>
                    <SelectItem value="poupanca">Poupança</SelectItem>
                    <SelectItem value="investimento">Investimento</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="inativa">Inativa</SelectItem>
                    <SelectItem value="bloqueada">Bloqueada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="saldo">Saldo Inicial</Label>
              <Input
                id="saldo"
                type="number"
                step="0.01"
                value={formData.saldo}
                onChange={(e) => handleChange('saldo', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Observações adicionais"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {conta ? 'Atualizar' : 'Criar'} Conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContaModal;
