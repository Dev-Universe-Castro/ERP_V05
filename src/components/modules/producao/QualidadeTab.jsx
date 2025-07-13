
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, BarChart3 } from 'lucide-react';

const QualidadeTab = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('hoje');

  const inspecoes = [
    { 
      id: 1, 
      ordem: 'OP123456', 
      produto: 'Peça A', 
      quantidade: 100, 
      aprovados: 95, 
      rejeitados: 5, 
      status: 'Aprovado',
      inspetor: 'Carlos Lima',
      data: '2024-01-15'
    },
    { 
      id: 2, 
      ordem: 'OP123457', 
      produto: 'Peça B', 
      quantidade: 50, 
      aprovados: 48, 
      rejeitados: 2, 
      status: 'Aprovado',
      inspetor: 'Ana Costa',
      data: '2024-01-15'
    },
    { 
      id: 3, 
      ordem: 'OP123458', 
      produto: 'Peça C', 
      quantidade: 80, 
      aprovados: 70, 
      rejeitados: 10, 
      status: 'Reprovado',
      inspetor: 'João Santos',
      data: '2024-01-15'
    }
  ];

  const metricas = {
    totalInspecionado: 230,
    aprovados: 213,
    rejeitados: 17,
    taxaAprovacao: 92.6
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      case 'Reprovado':
        return 'bg-red-100 text-red-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Controle de Qualidade</h3>
        <div className="flex space-x-2">
          <Button
            variant={selectedPeriod === 'hoje' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('hoje')}
          >
            Hoje
          </Button>
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

      {/* Métricas de Qualidade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Inspecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.totalInspecionado}</div>
            <p className="text-xs text-gray-600">peças</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metricas.aprovados}</div>
            <p className="text-xs text-gray-600">peças</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rejeitados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metricas.rejeitados}</div>
            <p className="text-xs text-gray-600">peças</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Taxa de Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metricas.taxaAprovacao}%</div>
            <p className="text-xs text-gray-600">meta: 95%</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Inspeções */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">Inspeções Realizadas</h4>
        {inspecoes.map((inspecao) => (
          <Card key={inspecao.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">{inspecao.ordem}</CardTitle>
                  <p className="text-sm text-gray-600">{inspecao.produto}</p>
                </div>
                <Badge className={getStatusColor(inspecao.status)}>
                  {inspecao.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <span className="text-sm font-medium">Quantidade:</span>
                  <p className="text-sm text-gray-600">{inspecao.quantidade}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Aprovados:</span>
                  <p className="text-sm text-green-600">{inspecao.aprovados}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Rejeitados:</span>
                  <p className="text-sm text-red-600">{inspecao.rejeitados}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Inspetor:</span>
                  <p className="text-sm text-gray-600">{inspecao.inspetor}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(inspecao.aprovados / inspecao.quantidade) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Taxa de aprovação: {Math.round((inspecao.aprovados / inspecao.quantidade) * 100)}%
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QualidadeTab;
