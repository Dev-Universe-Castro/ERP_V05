
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, BarChart3 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const PlanejamentoTab = () => {
  const { ordensProducao } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('semana');

  const getPlanning = () => {
    const hoje = new Date();
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return Array.from({ length: 7 }, (_, i) => {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      
      const ordensData = ordensProducao?.filter(ordem => {
        const dataInicio = new Date(ordem.dataInicio);
        return dataInicio.toDateString() === data.toDateString();
      }) || [];

      return {
        dia: diasSemana[data.getDay()],
        data: data.toLocaleDateString(),
        ordens: ordensData
      };
    });
  };

  const planejamento = getPlanning();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Planejamento da Produção</h3>
        <div className="flex space-x-2">
          <Button
            variant={selectedPeriod === 'semana' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('semana')}
          >
            Semana
          </Button>
          <Button
            variant={selectedPeriod === 'mes' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('mes')}
          >
            Mês
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {planejamento.map((dia, index) => (
          <Card key={index} className="min-h-[200px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-center">
                {dia.dia}
                <br />
                <span className="text-xs text-gray-500">{dia.data}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dia.ordens.map((ordem) => (
                <div
                  key={ordem.id}
                  className="p-2 bg-blue-50 rounded text-xs border-l-2 border-blue-400"
                >
                  <div className="font-medium">{ordem.numero}</div>
                  <div className="text-gray-600">{ordem.produto}</div>
                  <div className="flex items-center text-gray-500">
                    <Users className="h-3 w-3 mr-1" />
                    {ordem.responsavel}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Capacidade de Produção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Utilizada:</span>
                <span className="font-medium">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recursos Alocados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Máquinas:</span>
                <span className="font-medium">8/10</span>
              </div>
              <div className="flex justify-between">
                <span>Operadores:</span>
                <span className="font-medium">15/20</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Eficiência Prevista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">87%</div>
            <p className="text-sm text-gray-600">Meta: 90%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanejamentoTab;
