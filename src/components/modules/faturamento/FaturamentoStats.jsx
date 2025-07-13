
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const FaturamentoStats = ({ 
  totalNfes, 
  nfesMes, 
  nfesAutorizadas, 
  nfesRejeitadas, 
  nfesCanceladas,
  faturamentoMes, 
  faturamentoTotal, 
  percentualSucesso 
}) => {
  const stats = [
    {
      title: 'NFes Este Mês',
      value: nfesMes || 0,
      subtitle: `${totalNfes || 0} total`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Faturamento Mês',
      value: `R$ ${(faturamentoMes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `R$ ${(faturamentoTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'NFes Autorizadas',
      value: nfesAutorizadas || 0,
      subtitle: `${(percentualSucesso || 0).toFixed(1)}% de sucesso`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'NFes Rejeitadas',
      value: nfesRejeitadas || 0,
      subtitle: `${nfesCanceladas || 0} canceladas`,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
  );
};

export default FaturamentoStats;
