
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Fuel, 
  Truck, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const AbastecimentoStats = ({ equipamentos, abastecimentos }) => {
  // Calcular estatísticas
  const totalEquipamentos = equipamentos.length;
  const equipamentosAtivos = equipamentos.filter(eq => eq.status === 'ativo').length;
  const equipamentosManutencao = equipamentos.filter(eq => eq.status === 'manutencao').length;
  
  const totalAbastecimentos = abastecimentos.length;
  const totalLitros = abastecimentos.reduce((acc, ab) => acc + ab.litros, 0);
  const totalGastos = abastecimentos.reduce((acc, ab) => acc + ab.valor, 0);
  
  const precoMedioLitro = totalLitros > 0 ? totalGastos / totalLitros : 0;
  
  // Consumo médio geral
  const consumoMedio = abastecimentos.length > 0 
    ? abastecimentos.reduce((acc, ab) => acc + ab.consumo, 0) / abastecimentos.length 
    : 0;
  
  // Abastecimentos este mês
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  
  const abastecimentosMes = abastecimentos.filter(ab => 
    new Date(ab.data) >= inicioMes
  );
  
  const litrosMes = abastecimentosMes.reduce((acc, ab) => acc + ab.litros, 0);
  const gastosMes = abastecimentosMes.reduce((acc, ab) => acc + ab.valor, 0);
  
  // Eficiência da frota
  const equipamentosComDados = equipamentos.filter(eq => {
    const abastEq = abastecimentos.filter(ab => ab.equipamentoId === eq.id);
    return abastEq.length > 0;
  });
  
  const equipamentosEficientes = equipamentosComDados.filter(eq => {
    const abastEq = abastecimentos.filter(ab => ab.equipamentoId === eq.id);
    const consumoReal = abastEq.length > 0 
      ? abastEq.reduce((acc, ab) => acc + ab.consumo, 0) / abastEq.length 
      : 0;
    return consumoReal >= eq.consumoMedio * 0.9;
  }).length;
  
  // Alertas
  const alertasManutencao = equipamentos.filter(eq => {
    if (eq.medidor === 'km') {
      const proximaManutencao = Math.ceil(eq.medidorAtual / 10000) * 10000;
      return (proximaManutencao - eq.medidorAtual) <= 1000;
    } else if (eq.medidor === 'horas') {
      const proximaManutencao = Math.ceil(eq.medidorAtual / 250) * 250;
      return (proximaManutencao - eq.medidorAtual) <= 50;
    }
    return false;
  }).length;

  const stats = [
    {
      title: 'Total de Equipamentos',
      value: totalEquipamentos,
      subtitle: `${equipamentosAtivos} ativos, ${equipamentosManutencao} em manutenção`,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Abastecimentos',
      value: totalAbastecimentos,
      subtitle: `${abastecimentosMes.length} este mês`,
      icon: Fuel,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Litros',
      value: `${totalLitros.toFixed(0)}L`,
      subtitle: `${litrosMes.toFixed(0)}L este mês`,
      icon: Fuel,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Gastos Totais',
      value: `R$ ${totalGastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `R$ ${gastosMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} este mês`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Preço Médio/Litro',
      value: `R$ ${precoMedioLitro.toFixed(2)}`,
      subtitle: `Consumo médio: ${consumoMedio.toFixed(1)} km/L`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Eficiência da Frota',
      value: `${equipamentosComDados.length > 0 ? Math.round((equipamentosEficientes / equipamentosComDados.length) * 100) : 0}%`,
      subtitle: `${equipamentosEficientes}/${equipamentosComDados.length} equipamentos eficientes`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alertas e indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Alertas de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-yellow-600">{alertasManutencao}</p>
                <p className="text-sm text-gray-600">Equipamentos próximos da manutenção</p>
              </div>
              <Badge variant={alertasManutencao > 0 ? "destructive" : "secondary"}>
                {alertasManutencao > 0 ? "Atenção" : "OK"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Status da Frota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Equipamentos Ativos</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${totalEquipamentos > 0 ? (equipamentosAtivos / totalEquipamentos) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{equipamentosAtivos}/{totalEquipamentos}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Em Manutenção</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${totalEquipamentos > 0 ? (equipamentosManutencao / totalEquipamentos) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{equipamentosManutencao}/{totalEquipamentos}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Resumo do Mês Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{abastecimentosMes.length}</p>
              <p className="text-sm text-gray-600">Abastecimentos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{litrosMes.toFixed(0)}L</p>
              <p className="text-sm text-gray-600">Litros Consumidos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                R$ {gastosMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-600">Gastos do Mês</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                R$ {litrosMes > 0 ? (gastosMes / litrosMes).toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-gray-600">Preço Médio/L</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbastecimentoStats;
