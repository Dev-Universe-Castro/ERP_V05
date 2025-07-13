
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import DespesaModal from './DespesaModal';

const DespesasTab = ({ financeiroHook }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDespesa, setSelectedDespesa] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const { toast } = useToast();

  const despesas = financeiroHook.despesas.getAll();

  const categorias = [
    { value: 'pagamento_fornecedor', label: 'Pagamento Fornecedor' },
    { value: 'folha_pagamento', label: 'Folha de Pagamento' },
    { value: 'impostos', label: 'Impostos' },
    { value: 'aluguel', label: 'Aluguel' },
    { value: 'energia', label: 'Energia' },
    { value: 'telefone', label: 'Telefone' },
    { value: 'combustivel', label: 'Combustível' },
    { value: 'manutencao', label: 'Manutenção' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'outras', label: 'Outras' }
  ];

  const despesasFiltradas = despesas.filter(despesa => {
    if (filtroCategoria !== 'todas' && despesa.categoria !== filtroCategoria) return false;
    if (filtroStatus !== 'todos' && despesa.status !== filtroStatus) return false;
    if (searchTerm && !despesa.descricao.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    if (dataInicio) {
      const dataDespesa = new Date(despesa.dataPagamento || despesa.data);
      if (dataDespesa < new Date(dataInicio)) return false;
    }
    
    if (dataFim) {
      const dataDespesa = new Date(despesa.dataPagamento || despesa.data);
      if (dataDespesa > new Date(dataFim)) return false;
    }
    
    return true;
  });

  const handleEditDespesa = (despesa) => {
    setSelectedDespesa(despesa);
    setShowModal(true);
  };

  const handleDeleteDespesa = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      const success = await financeiroHook.despesas.delete(id);
      if (success) {
        toast({
          title: "Despesa excluída",
          description: "A despesa foi excluída com sucesso.",
        });
      }
    }
  };

  const handleExportarDespesas = () => {
    const dadosExport = despesasFiltradas.map(despesa => ({
      data: new Date(despesa.dataPagamento || despesa.data).toLocaleDateString('pt-BR'),
      descricao: despesa.descricao,
      categoria: despesa.categoria,
      valor: despesa.valor,
      status: despesa.status,
      formaPagamento: despesa.formaPagamento,
      fornecedor: despesa.fornecedor,
      centroCusto: despesa.centroCusto,
      observacoes: despesa.observacoes
    }));

    const csv = [
      ['Data', 'Descrição', 'Categoria', 'Valor', 'Status', 'Forma Pagamento', 'Fornecedor', 'Centro Custo', 'Observações'],
      ...dadosExport.map(item => [
        item.data,
        item.descricao,
        item.categoria,
        item.valor,
        item.status,
        item.formaPagamento,
        item.fornecedor,
        item.centroCusto,
        item.observacoes
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `despesas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoriaLabel = (categoria) => {
    const cat = categorias.find(c => c.value === categoria);
    return cat ? cat.label : categoria;
  };

  const totalDespesas = despesasFiltradas.reduce((total, despesa) => total + despesa.valor, 0);
  const despesasPagas = despesasFiltradas.filter(d => d.status === 'pago').length;
  const despesasPendentes = despesasFiltradas.filter(d => d.status === 'pendente').length;
  const maiorDespesa = Math.max(...despesasFiltradas.map(d => d.valor), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Despesas</h2>
          <p className="text-gray-600">Gerencie suas despesas e saídas</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Despesa
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Total Despesas</p>
                <p className="text-xl font-bold text-red-700">
                  R$ {totalDespesas.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Pagas</p>
                <p className="text-xl font-bold text-green-700">{despesasPagas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-xl font-bold text-yellow-700">{despesasPendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Maior Despesa</p>
                <p className="text-xl font-bold text-purple-700">
                  R$ {maiorDespesa.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar despesas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportarDespesas}>
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Despesas */}
      <div className="space-y-4">
        {despesasFiltradas.map((despesa, index) => (
          <motion.div
            key={despesa.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{despesa.descricao}</h3>
                      <Badge className={getStatusColor(despesa.status)}>
                        {despesa.status}
                      </Badge>
                      <Badge variant="outline">
                        {getCategoriaLabel(despesa.categoria)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Valor:</span>
                        <span className="font-bold text-red-600 ml-2">
                          R$ {despesa.valor.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Data:</span>
                        <span className="ml-2">
                          {new Date(despesa.dataPagamento || despesa.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Forma Pagamento:</span>
                        <span className="ml-2">{despesa.formaPagamento || 'Não informado'}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Fornecedor:</span>
                        <span className="ml-2">{despesa.fornecedor || 'Não informado'}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Centro Custo:</span>
                        <span className="ml-2">{despesa.centroCusto || 'Não informado'}</span>
                      </div>
                    </div>
                    
                    {despesa.observacoes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Observações:</span> {despesa.observacoes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditDespesa(despesa)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDespesa(despesa.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {despesasFiltradas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma despesa encontrada</h3>
            <p className="text-gray-600">Não há despesas que correspondam aos filtros aplicados.</p>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <DespesaModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedDespesa(null);
        }}
        despesa={selectedDespesa}
        onSave={async (despesa) => {
          if (selectedDespesa) {
            await financeiroHook.despesas.update(selectedDespesa.id, despesa);
          } else {
            await financeiroHook.criarDespesa(despesa);
          }
          setShowModal(false);
          setSelectedDespesa(null);
        }}
        categorias={categorias}
        contasFinanceiras={financeiroHook.contasFinanceiras.getAll()}
      />
    </div>
  );
};

export default DespesasTab;
