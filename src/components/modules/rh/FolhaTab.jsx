
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Download, FileSpreadsheet, Plus } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import FolhaModal from './FolhaModal';

const FolhaTab = () => {
  const { folhasPagamento, funcionarios } = useData();
  const [selectedPeriodo, setSelectedPeriodo] = useState(new Date().toISOString().slice(0, 7));
  const [showModal, setShowModal] = useState(false);
  const [selectedFolha, setSelectedFolha] = useState(null);

  const getFolhasPeriodo = () => {
    return folhasPagamento?.filter(folha => 
      folha.periodo === selectedPeriodo
    ) || [];
  };

  const calcularTotais = () => {
    const folhas = getFolhasPeriodo();
    return {
      totalSalarios: folhas.reduce((sum, f) => sum + (f.salarioBase || 0), 0),
      totalDescontos: folhas.reduce((sum, f) => sum + (f.descontos || 0), 0),
      totalLiquido: folhas.reduce((sum, f) => sum + (f.salarioLiquido || 0), 0),
      totalFuncionarios: folhas.length
    };
  };

  const totais = calcularTotais();
  const folhas = getFolhasPeriodo();

  const handleEdit = (folha) => {
    setSelectedFolha(folha);
    setShowModal(true);
  };

  const handleCalcular = () => {
    // Lógica para calcular folha automaticamente
    console.log('Calculando folha de pagamento...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Folha de Pagamento</h3>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCalcular} className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calcular Folha
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Folha
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Período:</label>
        <Input
          type="month"
          value={selectedPeriodo}
          onChange={(e) => setSelectedPeriodo(e.target.value)}
          className="w-auto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Funcionários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totais.totalFuncionarios}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Salários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totais.totalSalarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Descontos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totais.totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totais.totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Folhas de Pagamento - {selectedPeriodo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Funcionário</th>
                  <th className="text-left p-2">Cargo</th>
                  <th className="text-left p-2">Salário Base</th>
                  <th className="text-left p-2">Horas Extras</th>
                  <th className="text-left p-2">Benefícios</th>
                  <th className="text-left p-2">Descontos</th>
                  <th className="text-left p-2">Salário Líquido</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {folhas.map((folha) => {
                  const funcionario = funcionarios?.find(f => f.id === folha.funcionarioId);
                  return (
                    <tr key={folha.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{funcionario?.nome}</td>
                      <td className="p-2">{funcionario?.cargo}</td>
                      <td className="p-2">R$ {folha.salarioBase?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2">R$ {folha.horasExtras?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2">R$ {folha.beneficios?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2 text-red-600">R$ {folha.descontos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2 font-medium">R$ {folha.salarioLiquido?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2">
                        <Badge className={folha.status === 'Calculada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {folha.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(folha)}>
                          Editar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <FolhaModal
          folha={selectedFolha}
          onClose={() => {
            setShowModal(false);
            setSelectedFolha(null);
          }}
        />
      )}
    </div>
  );
};

export default FolhaTab;
