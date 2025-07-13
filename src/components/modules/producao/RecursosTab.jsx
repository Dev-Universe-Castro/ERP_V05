
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, AlertTriangle, CheckCircle } from 'lucide-react';

const RecursosTab = () => {
  const [activeTab, setActiveTab] = useState('maquinas');

  const maquinas = [
    { id: 1, nome: 'Torno CNC 01', status: 'Operando', operador: 'João Silva', producao: '85%' },
    { id: 2, nome: 'Fresadora 02', status: 'Manutenção', operador: '-', producao: '0%' },
    { id: 3, nome: 'Prensa 03', status: 'Disponível', operador: '-', producao: '0%' },
    { id: 4, nome: 'Soldadora 04', status: 'Operando', operador: 'Maria Santos', producao: '92%' }
  ];

  const operadores = [
    { id: 1, nome: 'João Silva', turno: 'Manhã', maquina: 'Torno CNC 01', status: 'Ativo' },
    { id: 2, nome: 'Maria Santos', turno: 'Manhã', maquina: 'Soldadora 04', status: 'Ativo' },
    { id: 3, nome: 'Pedro Costa', turno: 'Tarde', maquina: '-', status: 'Disponível' },
    { id: 4, nome: 'Ana Oliveira', turno: 'Noite', maquina: '-', status: 'Folga' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Operando':
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Manutenção':
        return 'bg-red-100 text-red-800';
      case 'Disponível':
        return 'bg-blue-100 text-blue-800';
      case 'Folga':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const renderMaquinas = () => (
    <div className="grid gap-4">
      {maquinas.map((maquina) => (
        <Card key={maquina.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{maquina.nome}</CardTitle>
              <Badge className={getStatusColor(maquina.status)}>
                {maquina.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium">Operador:</span>
                <p className="text-sm text-gray-600">{maquina.operador}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Produção:</span>
                <p className="text-sm text-gray-600">{maquina.producao}</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderOperadores = () => (
    <div className="grid gap-4">
      {operadores.map((operador) => (
        <Card key={operador.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{operador.nome}</CardTitle>
              <Badge className={getStatusColor(operador.status)}>
                {operador.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium">Turno:</span>
                <p className="text-sm text-gray-600">{operador.turno}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Máquina:</span>
                <p className="text-sm text-gray-600">{operador.maquina}</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <Button
          variant={activeTab === 'maquinas' ? 'default' : 'outline'}
          onClick={() => setActiveTab('maquinas')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Máquinas
        </Button>
        <Button
          variant={activeTab === 'operadores' ? 'default' : 'outline'}
          onClick={() => setActiveTab('operadores')}
        >
          <Users className="h-4 w-4 mr-2" />
          Operadores
        </Button>
      </div>

      {activeTab === 'maquinas' && renderMaquinas()}
      {activeTab === 'operadores' && renderOperadores()}
    </div>
  );
};

export default RecursosTab;
