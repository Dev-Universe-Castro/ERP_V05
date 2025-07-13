
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Target,
  Users,
  Package
} from 'lucide-react';

const ComercialStats = ({ estatisticas, indicadores }) => {
  const stats = [
    {
      title: 'Pedidos de Venda',
      value: estatisticas.pedidos.total,
      subtitle: `${estatisticas.pedidos.mes} este mês`,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Propostas Ativas',
      value: estatisticas.propostas.enviadas + estatisticas.propostas.elaboracao,
      subtitle: `${estatisticas.propostas.convertidas} convertidas`,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Faturamento Mensal',
      value: `R$ ${estatisticas.faturamento.valorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `${estatisticas.faturamento.mes} notas fiscais`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${estatisticas.vendas.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: 'Por pedido',
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Taxa de Conversão',
      value: `${indicadores.taxaConversao.toFixed(1)}%`,
      subtitle: 'Propostas para pedidos',
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Comissões Totais',
      value: `R$ ${estatisticas.comissoes.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `${estatisticas.comissoes.total} comissões`,
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
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

      {/* Performance e metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Target className="h-5 w-5 mr-2 text-green-500" />
              Atingimento de Meta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Meta Mensal</span>
                <span className="text-sm font-medium">
                  R$ {indicadores.metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Realizado</span>
                <span className="text-sm font-medium">
                  R$ {indicadores.realizadoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Percentual</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${
                        indicadores.atingimentoMeta >= 100 ? 'bg-green-500' :
                        indicadores.atingimentoMeta >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, indicadores.atingimentoMeta)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{indicadores.atingimentoMeta.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Package className="h-5 w-5 mr-2 text-blue-500" />
              Pipeline de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Orçamentos</span>
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">
                    {estatisticas.pedidos.orcamentos}
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aprovados</span>
                <div className="flex items-center">
                  <Badge variant="default" className="mr-2 bg-blue-500">
                    {estatisticas.pedidos.aprovados}
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Faturados</span>
                <div className="flex items-center">
                  <Badge variant="default" className="mr-2 bg-green-500">
                    {estatisticas.pedidos.faturados}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Entregues</span>
                <div className="flex items-center">
                  <Badge variant="default" className="mr-2 bg-purple-500">
                    {estatisticas.pedidos.entregues}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores de performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Indicadores de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{indicadores.taxaConversao.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Taxa de Conversão</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{indicadores.tempoMedioVenda.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Tempo Médio de Venda (dias)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{indicadores.pedidosNoPrazo}</p>
              <p className="text-sm text-gray-600">Entregas no Prazo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComercialStats;
