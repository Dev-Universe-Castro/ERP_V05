
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Bot
} from 'lucide-react';

const NotasFiscaisStats = ({ 
  totalNfes, 
  nfesMes, 
  nfesAutorizadas, 
  nfesPendentesManifestacao,
  valorTotalMes, 
  valorTotalGeral, 
  ultimaBusca,
  statusUltimaBusca
}) => {
  const stats = [
    {
      title: 'NFes Este Mês',
      value: nfesMes || 0,
      subtitle: `${totalNfes || 0} total recebidas`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Valor Total Mês',
      value: `R$ ${(valorTotalMes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `R$ ${(valorTotalGeral || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'NFes Autorizadas',
      value: nfesAutorizadas || 0,
      subtitle: `${totalNfes > 0 ? Math.round((nfesAutorizadas / totalNfes) * 100) : 0}% do total`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pendentes Manifestação',
      value: nfesPendentesManifestacao || 0,
      subtitle: 'Requer atenção',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Última Busca Bot',
      value: ultimaBusca ? new Date(ultimaBusca).toLocaleDateString('pt-BR') : 'Nunca',
      subtitle: statusUltimaBusca === 'concluido' ? 'Sucesso' : statusUltimaBusca || 'Não executado',
      icon: Bot,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Status Compliance',
      value: nfesPendentesManifestacao === 0 ? '100%' : 
             `${Math.round(((totalNfes - nfesPendentesManifestacao) / totalNfes) * 100)}%`,
      subtitle: 'Manifestações em dia',
      icon: Clock,
      color: nfesPendentesManifestacao === 0 ? 'text-green-600' : 'text-yellow-600',
      bgColor: nfesPendentesManifestacao === 0 ? 'bg-green-100' : 'bg-yellow-100'
    }
  ];

  return (
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
  );
};

export default NotasFiscaisStats;
