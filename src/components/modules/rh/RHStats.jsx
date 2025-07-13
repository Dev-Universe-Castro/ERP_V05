
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const RHStats = () => {
  const { funcionarios, folhasPagamento } = useData();

  const stats = {
    totalFuncionarios: funcionarios?.length || 0,
    funcionariosAtivos: funcionarios?.filter(f => f.status === 'Ativo').length || 0,
    folhaAtual: folhasPagamento?.reduce((total, folha) => total + (folha.salarioLiquido || 0), 0) || 0,
    pendencias: funcionarios?.filter(f => f.documentosPendentes).length || 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFuncionarios}</div>
          <p className="text-xs text-muted-foreground">{stats.funcionariosAtivos} ativos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Folha do Mês</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {stats.folhaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">valor total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1.840</div>
          <p className="text-xs text-muted-foreground">este mês</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendências</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendencias}</div>
          <p className="text-xs text-muted-foreground">documentos</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RHStats;
