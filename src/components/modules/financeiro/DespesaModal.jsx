
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, TrendingDown } from 'lucide-react';

const DespesaModal = ({ isOpen, onClose, despesa, onSave, categorias, contasFinanceiras }) => {
  const [formData, setFormData] = useState({
    descricao: '',
    categoria: 'outras',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    status: 'pago',
    formaPagamento: 'Transferência',
    fornecedor: '',
    centroCusto: 'Geral',
    contaFinanceiraId: '',
    observacoes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (despesa) {
      setFormData({
        descricao: despesa.descricao || '',
        categoria: despesa.categoria || 'outras',
        valor: despesa.valor?.toString() || '',
        data: despesa.data ? despesa.data.split('T')[0] : new Date().toISOString().split('T')[0],
        status: despesa.status || 'pago',
        formaPagamento: despesa.formaPagamento || 'Transferência',
        fornecedor: despesa.fornecedor || '',
        centroCusto: despesa.centroCusto || 'Geral',
        contaFinanceiraId: despesa.contaFinanceiraId || '',
        observacoes: despesa.observacoes || ''
      });
    } else {
      setFormData({
        descricao: '',
        categoria: 'outras',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        status: 'pago',
        formaPagamento: 'Transferência',
        fornecedor: '',
        centroCusto: 'Geral',
        contaFinanceiraId: '',
        observacoes: ''
      });
    }
    setErrors({});
  }, [despesa, isOpen]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }
    
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }
    
    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    const dadosDespesa = {
      ...formData,
      valor: parseFloat(formData.valor),
      contaFinanceiraId: formData.contaFinanceiraId || null
    };

    onSave(dadosDespesa);
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
              <TrendingDown className="h-5 w-5" />
              {despesa ? 'Editar Despesa' : 'Nova Despesa'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                placeholder="Descrição da despesa"
                className={errors.descricao ? 'border-red-500' : ''}
              />
              {errors.descricao && <p className="text-red-500 text-sm mt-1">{errors.descricao}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={formData.categoria} onValueChange={(value) => handleChange('categoria', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valor">Valor *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => handleChange('valor', e.target.value)}
                  placeholder="0.00"
                  className={errors.valor ? 'border-red-500' : ''}
                />
                {errors.valor && <p className="text-red-500 text-sm mt-1">{errors.valor}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => handleChange('data', e.target.value)}
                  className={errors.data ? 'border-red-500' : ''}
                />
                {errors.data && <p className="text-red-500 text-sm mt-1">{errors.data}</p>}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
              <Select value={formData.formaPagamento} onValueChange={(value) => handleChange('formaPagamento', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  value={formData.fornecedor}
                  onChange={(e) => handleChange('fornecedor', e.target.value)}
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div>
                <Label htmlFor="centroCusto">Centro de Custo</Label>
                <Select value={formData.centroCusto} onValueChange={(value) => handleChange('centroCusto', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o centro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Geral">Geral</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Vendas">Vendas</SelectItem>
                    <SelectItem value="Produção">Produção</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="contaFinanceiraId">Conta Financeira</Label>
              <Select value={formData.contaFinanceiraId} onValueChange={(value) => handleChange('contaFinanceiraId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma conta</SelectItem>
                  {contasFinanceiras.map(conta => (
                    <SelectItem key={conta.id} value={conta.id.toString()}>
                      {conta.nome} - {conta.banco}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {despesa ? 'Atualizar' : 'Criar'} Despesa
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DespesaModal;
