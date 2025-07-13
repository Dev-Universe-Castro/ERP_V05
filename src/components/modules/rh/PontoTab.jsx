
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Download, Upload } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const PontoTab = () => {
  const { funcionarios, registrosPonto } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getRegistrosData = () => {
    return registrosPonto?.filter(registro => 
      registro.data === selectedDate
    ) || [];
  };

  const calcularHoras = (entrada, saida) => {
    if (!entrada || !saida) return '00:00';
    
    const [hE, mE] = entrada.split(':').map(Number);
    const [hS, mS] = saida.split(':').map(Number);
    
    const minutosEntrada = hE * 60 + mE;
    const minutosSaida = hS * 60 + mS;
    
    const totalMinutos = minutosSaida - minutosEntrada;
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  };

  const registros = getRegistrosData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Controle de Ponto</h3>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Presentes Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registros.filter(r => r.presente).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Faltas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registros.filter(r => !r.presente).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Horas Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Atrasos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Funcionário</th>
                  <th className="text-left p-2">Entrada</th>
                  <th className="text-left p-2">Saída Almoço</th>
                  <th className="text-left p-2">Volta Almoço</th>
                  <th className="text-left p-2">Saída</th>
                  <th className="text-left p-2">Total Horas</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios?.map((funcionario) => {
                  const registro = registros.find(r => r.funcionarioId === funcionario.id);
                  const totalHoras = registro ? calcularHoras(registro.entrada, registro.saida) : '00:00';
                  
                  return (
                    <tr key={funcionario.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{funcionario.nome}</td>
                      <td className="p-2">{registro?.entrada || '-'}</td>
                      <td className="p-2">{registro?.saidaAlmoco || '-'}</td>
                      <td className="p-2">{registro?.voltaAlmoco || '-'}</td>
                      <td className="p-2">{registro?.saida || '-'}</td>
                      <td className="p-2">{totalHoras}</td>
                      <td className="p-2">
                        <Badge 
                          className={
                            registro?.presente 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {registro?.presente ? 'Presente' : 'Ausente'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PontoTab;
