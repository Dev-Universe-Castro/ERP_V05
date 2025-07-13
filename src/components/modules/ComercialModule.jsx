"use client"

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, FileText, DollarSign, Users, BarChart3,
  Plus, Search, Download, Eye, Edit, Trash2, 
  CheckCircle, AlertTriangle, Clock, X, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useComercial } from '@/hooks/useComercial';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useData } from '@/contexts/DataContext';
import { useWorkflow } from '@/hooks/useWorkflow';
import ComercialSidebar from './comercial/ComercialSidebar';
import ComercialStats from './comercial/ComercialStats';
import CompliancePanel from '../common/CompliancePanel';
import WorkflowSteps from '../common/WorkflowSteps';
import * as XLSX from 'xlsx';

const getStatusBadge = (status) => {
  const statusMap = {
    'orcamento': 'bg-yellow-100 text-yellow-800',
    'aprovado': 'bg-blue-100 text-blue-800',
    'faturado': 'bg-green-100 text-green-800',
    'entregue': 'bg-purple-100 text-purple-800',
    'cancelado': 'bg-red-100 text-red-800',
    'elaboracao': 'bg-gray-100 text-gray-800',
    'enviada': 'bg-blue-100 text-blue-800',
    'aprovada': 'bg-green-100 text-green-800',
    'convertida': 'bg-purple-100 text-purple-800',
    'rejeitada': 'bg-red-100 text-red-800'
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'orcamento': return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'aprovado': return <CheckCircle className="h-4 w-4 text-blue-600" />;
    case 'faturado': return <FileText className="h-4 w-4 text-green-600" />;
    case 'entregue': return <Package className="h-4 w-4 text-purple-600" />;
    case 'cancelado': return <X className="h-4 w-4 text-red-600" />;
    default: return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const PedidosTable = ({ pedidos, onEdit, onDelete, onView }) => (
  <div className="data-table rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Número</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Cliente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vendedor</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Total</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {pedidos.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm text-gray-800 font-mono">{item.numeroPedido}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.cliente}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.vendedor || 'Não definido'}</td>
              <td className="px-4 py-3 text-sm text-gray-800">
                {new Date(item.dataEmissao).toLocaleDateString('pt-BR')}
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

const PropostasTable = ({ propostas, onEdit, onDelete, onView }) => (
  <div className="data-table rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Número</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Cliente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vendedor</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Validade</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Total</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Probabilidade</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {propostas.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm text-gray-800 font-mono">{item.numeroProposta}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.cliente}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.vendedor || 'Não definido'}</td>
              <td className="px-4 py-3 text-sm text-gray-800">
                {item.dataValidade ? new Date(item.dataValidade).toLocaleDateString('pt-BR') : 'Não definida'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">
                R$ {(item.valorTotal || 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                {item.probabilidade || 0}%
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

const ComissoesTable = ({ comissoes, onEdit, onDelete, onView }) => (
  <div className="data-table rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vendedor</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Cliente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Pedido</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Venda</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">% Comissão</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Comissão</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {comissoes.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm text-gray-800">{item.vendedor}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.cliente}</td>
              <td className="px-4 py-3 text-sm text-gray-800 font-mono">{item.numeroPedido}</td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                R$ {(item.valorVenda || 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                {item.percentualComissao || 0}%
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">
                R$ {(item.valorComissao || 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(item.status)}`}>
                  {item.status}
                </span>
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

const VendedoresTable = ({ vendedores, onEdit, onDelete, onView }) => (
  <div className="data-table rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nome</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Telefone</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">% Comissão</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {vendedores.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm text-gray-800">{item.nome}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.email}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.telefone}</td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                {item.percentualComissao || 0}%
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(item.status)}`}>
                  {item.status}
                </span>
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
      { Métrica: 'Total de Pedidos', Valor: estatisticas.pedidos.total },
      { Métrica: 'Pedidos do Mês', Valor: estatisticas.pedidos.mes },
      { Métrica: 'Orçamentos', Valor: estatisticas.pedidos.orcamentos },
      { Métrica: 'Pedidos Aprovados', Valor: estatisticas.pedidos.aprovados },
      { Métrica: 'Faturamento Mensal', Valor: estatisticas.faturamento.valorMes },
      { Métrica: 'Ticket Médio', Valor: estatisticas.vendas.ticketMedio },
      { Métrica: 'Taxa de Conversão (%)', Valor: indicadores.taxaConversao.toFixed(2) },
      { Métrica: 'Atingimento de Meta (%)', Valor: indicadores.atingimentoMeta.toFixed(2) }
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório Comercial');
    XLSX.writeFile(wb, `relatorio_comercial_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Relatório exportado",
      description: "Relatório comercial exportado com sucesso."
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
              <SelectItem value="pedidos">Apenas Pedidos</SelectItem>
              <SelectItem value="propostas">Apenas Propostas</SelectItem>
              <SelectItem value="comissoes">Apenas Comissões</SelectItem>
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

      <ComercialStats estatisticas={estatisticas} indicadores={indicadores} />
    </div>
  );
};

// Regras de compliance para comercial
const complianceRules = [
  {
    id: 'proposal_approval',
    name: 'Aprovação de Propostas',
    description: 'Propostas acima de R$ 10.000 devem ser aprovadas',
    category: 'Financeiro'
  },
  {
    id: 'delivery_tracking',
    name: 'Rastreamento de Entregas',
    description: 'Todas as entregas devem ser rastreadas',
    category: 'Operacional'
  },
  {
    id: 'commission_calculation',
    name: 'Cálculo de Comissões',
    description: 'Comissões devem ser calculadas automaticamente',
    category: 'Financeiro'
  },
  {
    id: 'customer_documentation',
    name: 'Documentação do Cliente',
    description: 'Todos os clientes devem ter documentação completa',
    category: 'Compliance'
  }
];

export default function ComercialModule({ activeSection, onSectionChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const comercial = useComercial();
  const { logAction } = useAuditLog();
  const { executeWorkflow, getActiveWorkflows } = useWorkflow();
  const { searchItems } = useData();

  // Buscar dados
  const pedidosVenda = comercial.pedidosVenda.getAll();
  const propostas = comercial.propostas.getAll();
  const comissoes = comercial.comissoes.getAll();
  const vendedores = comercial.vendedores.getAll();

  // Estatísticas e indicadores
  const estatisticas = comercial.getEstatisticas();
  const indicadores = comercial.getIndicadores();

  const filteredData = useMemo(() => {
    const data = {
      pedidos: pedidosVenda,
      propostas,
      comissoes,
      vendedores
    };

    const currentData = data[activeSection] || [];

    return currentData.filter(item => {
      const matchesSearch = Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [activeSection, pedidosVenda, propostas, comissoes, vendedores, searchTerm, filterStatus]);

  const handleView = (item) => {
    setSelectedItem(item);
    // TODO: Implementar modal de visualização
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    // TODO: Implementar modal de edição
  };

  const handleDelete = async (item) => {
    if (confirm(`Deseja realmente excluir este ${activeSection.slice(0, -1)}?`)) {
      try {
        setLoading(true);
        await comercial[activeSection].delete(item.id);
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
        ID: item.id,
        'Data Criação': new Date(item.createdAt || item.dataEmissao).toLocaleDateString('pt-BR'),
        Status: item.status
      };

      if (activeSection === 'pedidos') {
        return {
          ...baseData,
          'Número': item.numeroPedido,
          Cliente: item.cliente,
          Vendedor: item.vendedor || 'Não definido',
          'Valor Total': item.valorTotal || 0
        };
      } else if (activeSection === 'propostas') {
        return {
          ...baseData,
          'Número': item.numeroProposta,
          Cliente: item.cliente,
          Vendedor: item.vendedor || 'Não definido',
          'Valor Total': item.valorTotal || 0,
          'Probabilidade (%)': item.probabilidade || 0
        };
      } else if (activeSection === 'comissoes') {
        return {
          ...baseData,
          Vendedor: item.vendedor,
          Cliente: item.cliente,
          'Valor Venda': item.valorVenda || 0,
          '% Comissão': item.percentualComissao || 0,
          'Valor Comissão': item.valorComissao || 0
        };
      } else if (activeSection === 'vendedores') {
        return {
          ...baseData,
          Nome: item.nome,
          Email: item.email,
          Telefone: item.telefone,
          '% Comissão': item.percentualComissao || 0
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
    pedidos: 'Pedidos de Venda',
    propostas: 'Propostas',
    comissoes: 'Comissões',
    vendedores: 'Vendedores',
    relatorios: 'Relatórios'
  }[activeSection];

  const renderContent = () => {
    switch (activeSection) {
      case 'pedidos':
        return filteredData.length > 0 ? (
          <PedidosTable 
            pedidos={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhum pedido encontrado' : 'Nenhum pedido cadastrado'}
            </p>
          </div>
        );

      case 'propostas':
        return filteredData.length > 0 ? (
          <PropostasTable 
            propostas={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta cadastrada'}
            </p>
          </div>
        );

      case 'comissoes':
        return filteredData.length > 0 ? (
          <ComissoesTable 
            comissoes={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhuma comissão encontrada' : 'Nenhuma comissão cadastrada'}
            </p>
          </div>
        );

      case 'vendedores':
        return filteredData.length > 0 ? (
          <VendedoresTable 
            vendedores={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhum vendedor encontrado' : 'Nenhum vendedor cadastrado'}
            </p>
          </div>
        );

      case 'relatorios':
        return <RelatoriosSection estatisticas={estatisticas} indicadores={indicadores} />;

      default:
        return <PedidosTable pedidos={filteredData} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />;
    }
  };

  const showSearchAndNew = ['pedidos', 'propostas', 'comissoes', 'vendedores'].includes(activeSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{sectionTitle}</h2>
          <p className="text-gray-500">Gestão completa do comercial e vendas</p>
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
        <ComercialStats estatisticas={estatisticas} indicadores={indicadores} />
      )}

      {/* Painel de Compliance */}
      <CompliancePanel rules={complianceRules} data={{ pedidosVenda, propostas, comissoes, vendedores }} />

      {/* Workflows Ativos */}
      <WorkflowSteps 
        activeWorkflows={getActiveWorkflows('comercial')}
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
              <SelectItem value="orcamento">Orçamento</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="faturado">Faturado</SelectItem>
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

ComercialModule.Sidebar = ComercialSidebar;
ComercialModule.defaultSection = 'pedidos';