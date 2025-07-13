
"use client"

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, FileText, Package, DollarSign, 
  Plus, Search, Download, MapPin, Clock, X,
  Eye, Edit, Trash2, CheckCircle, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useLogistica } from '@/hooks/useLogistica';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useData } from '@/contexts/DataContext';
import { useWorkflow } from '@/hooks/useWorkflow';
import LogisticaSidebar from './logistica/LogisticaSidebar';
import LogisticaStats from './logistica/LogisticaStats';
import CompliancePanel from '../common/CompliancePanel';
import WorkflowSteps from '../common/WorkflowSteps';
import * as XLSX from 'xlsx';

const getStatusBadge = (status) => {
  const statusMap = {
    'preparacao': 'bg-yellow-100 text-yellow-800',
    'em-transito': 'bg-blue-100 text-blue-800',
    'entregue': 'bg-green-100 text-green-800',
    'cancelado': 'bg-red-100 text-red-800',
    'planejada': 'bg-gray-100 text-gray-800',
    'em-andamento': 'bg-blue-100 text-blue-800',
    'finalizada': 'bg-green-100 text-green-800',
    'separacao': 'bg-orange-100 text-orange-800',
    'embarcado': 'bg-purple-100 text-purple-800'
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'preparacao': return <Package className="h-4 w-4 text-yellow-600" />;
    case 'em-transito': return <Truck className="h-4 w-4 text-blue-600" />;
    case 'entregue': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'cancelado': return <X className="h-4 w-4 text-red-600" />;
    default: return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const RomaneiosTable = ({ romaneios, onEdit, onDelete, onView }) => (
  <div className="data-table rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Número</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data Emissão</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Motorista</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Veículo</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Itens</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Total</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {romaneios.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm text-gray-800 font-mono">{item.numero}</td>
              <td className="px-4 py-3 text-sm text-gray-800">
                {new Date(item.dataEmissao).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.motorista || 'Não definido'}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.veiculo || 'Não definido'}</td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                {item.itens?.length || 0}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">
                R$ {(item.valorTotal || 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  {getStatusIcon(item.status)}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onView(item)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const EntregasTable = ({ entregas, onEdit, onDelete, onView }) => (
  <div className="data-table rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Número</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Cliente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Produto</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Endereço</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data Previsão</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Tentativas</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entregas.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm text-gray-800 font-mono">{item.numero}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.cliente}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.produto}</td>
              <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                {item.endereco}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">
                {item.dataPrevisao ? new Date(item.dataPrevisao).toLocaleDateString('pt-BR') : 'Não definida'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                {item.tentativas || 0}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  {getStatusIcon(item.status)}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onView(item)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RotasTable = ({ rotas, onEdit, onDelete, onView }) => (
  <div className="data-table rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Número</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Descrição</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Motorista</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Paradas</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Distância</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Tempo Est.</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rotas.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm text-gray-800 font-mono">{item.numero}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.descricao}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.motorista || 'Não definido'}</td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                {item.paradas?.length || 0}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                {(item.distanciaTotal || 0).toFixed(1)} km
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                {Math.floor((item.tempoEstimado || 0) / 60)}h {(item.tempoEstimado || 0) % 60}min
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  {getStatusIcon(item.status)}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onView(item)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ExpedicoesTable = ({ expedicoes, onEdit, onDelete, onView }) => (
  <div className="data-table rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Número</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Responsável</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Itens</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Peso Total</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {expedicoes.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm text-gray-800 font-mono">{item.numero}</td>
              <td className="px-4 py-3 text-sm text-gray-800">
                {new Date(item.dataEmissao).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.responsavel || 'Não definido'}</td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                {item.itensTotal || 0}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                {(item.pesoTotal || 0).toFixed(2)} kg
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  {getStatusIcon(item.status)}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onView(item)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RelatoriosSection = ({ estatisticas, indicadores }) => {
  const [filtroData, setFiltroData] = useState('mes');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const exportarRelatorio = () => {
    const dadosRelatorio = {
      estatisticas,
      indicadores,
      dataGeracao: new Date().toISOString(),
      periodo: filtroData,
      tipo: filtroTipo
    };

    const ws = XLSX.utils.json_to_sheet([
      { Métrica: 'Total de Romaneios', Valor: estatisticas.romaneios.total },
      { Métrica: 'Romaneios em Preparação', Valor: estatisticas.romaneios.preparacao },
      { Métrica: 'Romaneios em Trânsito', Valor: estatisticas.romaneios.emTransito },
      { Métrica: 'Romaneios Entregues', Valor: estatisticas.romaneios.entregues },
      { Métrica: 'Total de Entregas', Valor: estatisticas.entregas.total },
      { Métrica: 'Entregas Pendentes', Valor: estatisticas.entregas.pendentes },
      { Métrica: 'Entregas Concluídas', Valor: estatisticas.entregas.entregues },
      { Métrica: 'Taxa de Entrega (%)', Valor: indicadores.taxaEntrega.toFixed(2) },
      { Métrica: 'Taxa de Pontualidade (%)', Valor: indicadores.taxaPontualidade.toFixed(2) },
      { Métrica: 'Tempo Médio de Entrega (dias)', Valor: indicadores.tempoMedioEntrega.toFixed(2) }
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório Logística');
    XLSX.writeFile(wb, `relatorio_logistica_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Relatório exportado",
      description: "Relatório de logística exportado com sucesso."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div>
          <Label>Período</Label>
          <Select value={filtroData} onValueChange={setFiltroData}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Última semana</SelectItem>
              <SelectItem value="mes">Último mês</SelectItem>
              <SelectItem value="trimestre">Último trimestre</SelectItem>
              <SelectItem value="ano">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tipo de Relatório</Label>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Relatório Completo</SelectItem>
              <SelectItem value="romaneios">Apenas Romaneios</SelectItem>
              <SelectItem value="entregas">Apenas Entregas</SelectItem>
              <SelectItem value="rotas">Apenas Rotas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button onClick={exportarRelatorio} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      <LogisticaStats estatisticas={estatisticas} indicadores={indicadores} />

      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Performance de Entregas</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taxa de Entrega:</span>
                  <span className="font-medium">{indicadores.taxaEntrega.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pontualidade:</span>
                  <span className="font-medium">{indicadores.taxaPontualidade.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tempo Médio:</span>
                  <span className="font-medium">{indicadores.tempoMedioEntrega.toFixed(1)} dias</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Operações Ativas</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Romaneios em Preparação:</span>
                  <span className="font-medium">{estatisticas.romaneios.preparacao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Entregas Pendentes:</span>
                  <span className="font-medium">{estatisticas.entregas.pendentes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rotas em Andamento:</span>
                  <span className="font-medium">{estatisticas.rotas.emAndamento}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Regras de compliance para logística
const complianceRules = [
  {
    id: 'delivery_tracking',
    name: 'Rastreamento de Entregas',
    description: 'Todas as entregas devem ser rastreadas e documentadas',
    category: 'Operacional'
  },
  {
    id: 'route_optimization',
    name: 'Otimização de Rotas',
    description: 'Rotas devem ser otimizadas para eficiência',
    category: 'Eficiência'
  },
  {
    id: 'delivery_confirmation',
    name: 'Confirmação de Entrega',
    description: 'Entregas devem ser confirmadas com assinatura',
    category: 'Auditoria'
  },
  {
    id: 'vehicle_maintenance',
    name: 'Manutenção de Veículos',
    description: 'Veículos devem ter manutenção em dia',
    category: 'Segurança'
  }
];

export default function LogisticaModule({ activeSection, onSectionChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const logistica = useLogistica();
  const { logAction } = useAuditLog();
  const { executeWorkflow, getActiveWorkflows } = useWorkflow();
  const { searchItems } = useData();

  // Buscar dados
  const romaneios = logistica.romaneios.getAll();
  const entregas = logistica.entregas.getAll();
  const rotas = logistica.rotas.getAll();
  const expedicoes = logistica.expedicoes.getAll();

  // Estatísticas e indicadores
  const estatisticas = logistica.getEstatisticas();
  const indicadores = logistica.getIndicadores();

  const filteredData = useMemo(() => {
    const data = {
      romaneios,
      entregas,
      rotas,
      expedicoes
    };

    const currentData = data[activeSection] || [];
    
    return currentData.filter(item => {
      const matchesSearch = Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [activeSection, romaneios, entregas, rotas, expedicoes, searchTerm, filterStatus]);

  const handleView = (item) => {
    setSelectedItem(item);
    // TODO: Implementar modal de visualização
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    // TODO: Implementar modal de edição
  };

  const handleDelete = async (item) => {
    if (confirm(`Deseja realmente excluir ${activeSection.slice(0, -1)}?`)) {
      try {
        setLoading(true);
        await logistica[activeSection].delete(item.id);
        logAction('delete', activeSection, item.id);
      } catch (error) {
        // Erro já tratado no hook
      } finally {
        setLoading(false);
      }
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredData.map(item => {
      const baseData = {
        Número: item.numero,
        'Data Emissão': new Date(item.dataEmissao).toLocaleDateString('pt-BR'),
        Status: item.status
      };

      if (activeSection === 'romaneios') {
        return {
          ...baseData,
          Motorista: item.motorista || 'Não definido',
          Veículo: item.veiculo || 'Não definido',
          Itens: item.itens?.length || 0,
          'Valor Total': item.valorTotal || 0
        };
      } else if (activeSection === 'entregas') {
        return {
          ...baseData,
          Cliente: item.cliente,
          Produto: item.produto,
          Endereço: item.endereco,
          Tentativas: item.tentativas || 0
        };
      } else if (activeSection === 'rotas') {
        return {
          ...baseData,
          Descrição: item.descricao,
          Motorista: item.motorista || 'Não definido',
          Paradas: item.paradas?.length || 0,
          'Distância (km)': item.distanciaTotal || 0
        };
      } else if (activeSection === 'expedicoes') {
        return {
          ...baseData,
          Responsável: item.responsavel || 'Não definido',
          'Itens Total': item.itensTotal || 0,
          'Peso Total (kg)': item.pesoTotal || 0
        };
      }

      return baseData;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeSection);
    XLSX.writeFile(wb, `${activeSection}_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Exportação concluída",
      description: `Relatório de ${activeSection} exportado com sucesso.`
    });
  };

  const sectionTitle = {
    romaneios: 'Romaneios',
    entregas: 'Entregas',
    rotas: 'Rotas',
    expedicao: 'Expedição',
    relatorios: 'Relatórios'
  }[activeSection];

  const renderContent = () => {
    switch (activeSection) {
      case 'romaneios':
        return filteredData.length > 0 ? (
          <RomaneiosTable 
            romaneios={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhum romaneio encontrado' : 'Nenhum romaneio cadastrado'}
            </p>
          </div>
        );

      case 'entregas':
        return filteredData.length > 0 ? (
          <EntregasTable 
            entregas={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhuma entrega encontrada' : 'Nenhuma entrega cadastrada'}
            </p>
          </div>
        );

      case 'rotas':
        return filteredData.length > 0 ? (
          <RotasTable 
            rotas={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhuma rota encontrada' : 'Nenhuma rota cadastrada'}
            </p>
          </div>
        );

      case 'expedicao':
        return filteredData.length > 0 ? (
          <ExpedicoesTable 
            expedicoes={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhuma expedição encontrada' : 'Nenhuma expedição cadastrada'}
            </p>
          </div>
        );

      case 'relatorios':
        return <RelatoriosSection estatisticas={estatisticas} indicadores={indicadores} />;

      default:
        return <RomaneiosTable romaneios={filteredData} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />;
    }
  };

  const showSearchAndNew = ['romaneios', 'entregas', 'rotas', 'expedicao'].includes(activeSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{sectionTitle}</h2>
          <p className="text-gray-500">Gestão completa de logística e entregas</p>
        </div>
        {showSearchAndNew && (
          <div className="flex items-center space-x-3">
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar XLSX
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Novo {sectionTitle.slice(0, -1)}
            </Button>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      {activeSection !== 'relatorios' && (
        <LogisticaStats estatisticas={estatisticas} indicadores={indicadores} />
      )}

      {/* Painel de Compliance */}
      <CompliancePanel rules={complianceRules} data={{ romaneios, entregas, rotas, expedicoes }} />

      {/* Workflows Ativos */}
      <WorkflowSteps 
        activeWorkflows={getActiveWorkflows('logistica')}
        onExecuteStep={(workflowId, stepId, data) => executeWorkflow(workflowId, data)}
      />

      {/* Filtros */}
      {showSearchAndNew && (
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Buscar ${activeSection}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="preparacao">Preparação</SelectItem>
              <SelectItem value="em-transito">Em Trânsito</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Conteúdo Principal */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-800">{sectionTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}

LogisticaModule.Sidebar = LogisticaSidebar;
LogisticaModule.defaultSection = 'romaneios';
