
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  MapPin,
  FileText,
  TrendingUp
} from 'lucide-react';

const LogisticaStats = ({ estatisticas, indicadores }) => {
  const stats = [
    {
      title: 'Romaneios',
      value: estatisticas.romaneios.total,
      subtitle: `${estatisticas.romaneios.preparacao} em preparação`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Entregas Pendentes',
      value: estatisticas.entregas.pendentes,
      subtitle: `${estatisticas.entregas.hoje} hoje`,
      icon: Truck,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Entregas Concluídas',
      value: estatisticas.entregas.entregues,
      subtitle: `${estatisticas.entregas.mes} este mês`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Rotas Ativas',
      value: estatisticas.rotas.emAndamento,
      subtitle: `${estatisticas.rotas.planejadas} planejadas`,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Expedições',
      value: estatisticas.expedicoes.total,
      subtitle: `${estatisticas.expedicoes.preparacao} em preparação`,
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Taxa de Entrega',
      value: `${indicadores.taxaEntrega.toFixed(1)}%`,
      subtitle: 'Este mês',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
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

      {/* Indicadores de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Indicadores de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taxa de Entrega</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, indicadores.taxaEntrega)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{indicadores.taxaEntrega.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pontualidade</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, indicadores.taxaPontualidade)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{indicadores.taxaPontualidade.toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tempo Médio de Entrega</span>
                <span className="text-sm font-medium">{indicadores.tempoMedioEntrega.toFixed(1)} dias</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Status das Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Entregas no Prazo</span>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm font-medium">{indicadores.entregasNoPrazo}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Entregas Atrasadas</span>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm font-medium">{indicadores.entregasAtrasadas}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Entregas com Tentativas</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-sm font-medium">{estatisticas.entregas.tentativas}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LogisticaStats;
