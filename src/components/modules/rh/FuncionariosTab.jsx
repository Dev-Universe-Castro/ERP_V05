
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Edit, User, Building, Phone } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import FuncionarioModal from './FuncionarioModal';

const FuncionariosTab = () => {
  const { funcionarios } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);

  const filteredFuncionarios = funcionarios?.filter(funcionario =>
    funcionario.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status) => {
    const variants = {
      'Ativo': 'bg-green-100 text-green-800',
      'Inativo': 'bg-red-100 text-red-800',
      'Férias': 'bg-yellow-100 text-yellow-800',
      'Afastado': 'bg-gray-100 text-gray-800'
    };
    return variants[status] || variants['Ativo'];
  };

  const handleEdit = (funcionario) => {
    setSelectedFuncionario(funcionario);
    setShowModal(true);
  };

  const handleNew = () => {
    setSelectedFuncionario(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Funcionários</h3>
        <Button onClick={handleNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Funcionário
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar funcionários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFuncionarios.map((funcionario) => (
          <Card key={funcionario.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{funcionario.nome}</CardTitle>
                    <p className="text-xs text-gray-600">{funcionario.cargo}</p>
                  </div>
                </div>
                <Badge className={getStatusBadge(funcionario.status)}>
                  {funcionario.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Building className="h-3 w-3 mr-2" />
                  {funcionario.departamento}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-3 w-3 mr-2" />
                  {funcionario.telefone}
                </div>
                <div className="text-gray-600">
                  CPF: {funcionario.cpf}
                </div>
                <div className="text-gray-600">
                  Admissão: {new Date(funcionario.dataAdmissao).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-3 border-t">
                <span className="text-sm font-medium">
                  R$ {funcionario.salario?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(funcionario)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showModal && (
        <FuncionarioModal
          funcionario={selectedFuncionario}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default FuncionariosTab;
