
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const ProducaoStats = () => {
  const { ordensProducao } = useData();

  const stats = {
    ordensAbertas: ordensProducao?.filter(op => op.status === 'Em Andamento').length || 0,
    ordensConcluidas: ordensProducao?.filter(op => op.status === 'Concluída').length || 0,
    eficiencia: 85,
    alertas: ordensProducao?.filter(op => op.prioridade === 'Alta').length || 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ordens em Andamento</CardTitle>
          <Factory className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.ordensAbertas}</div>
          <p className="text-xs text-muted-foreground">ordens ativas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídas Hoje</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.ordensConcluidas}</div>
          <p className="text-xs text-muted-foreground">finalizadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.eficiencia}%</div>
          <p className="text-xs text-muted-foreground">meta: 90%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.alertas}</div>
          <p className="text-xs text-muted-foreground">prioridade alta</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProducaoStats;
