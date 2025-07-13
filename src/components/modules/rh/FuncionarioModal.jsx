
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const FuncionarioModal = ({ funcionario, onClose }) => {
  const { addItem, updateItem } = useData();
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    cargo: '',
    departamento: '',
    telefone: '',
    email: '',
    endereco: '',
    dataAdmissao: '',
    salario: '',
    status: 'Ativo',
    observacoes: ''
  });

  useEffect(() => {
    if (funcionario) {
      setFormData(funcionario);
    }
  }, [funcionario]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const funcionarioData = {
      ...formData,
      salario: parseFloat(formData.salario) || 0,
      id: funcionario?.id || Date.now()
    };

    if (funcionario) {
      updateItem('funcionarios', funcionarioData);
    } else {
      addItem('funcionarios', funcionarioData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="cargo">Cargo *</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="departamento">Departamento *</Label>
              <Select value={formData.departamento} onValueChange={(value) => setFormData({ ...formData, departamento: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                  <SelectItem value="Produção">Produção</SelectItem>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="RH">RH</SelectItem>
                  <SelectItem value="TI">TI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
              <Input
                id="dataAdmissao"
                type="date"
                value={formData.dataAdmissao}
                onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="salario">Salário *</Label>
              <Input
                id="salario"
                type="number"
                step="0.01"
                value={formData.salario}
                onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Férias">Férias</SelectItem>
                  <SelectItem value="Afastado">Afastado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {funcionario ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuncionarioModal;
