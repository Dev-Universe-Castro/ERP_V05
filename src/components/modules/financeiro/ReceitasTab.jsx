
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
  TrendingUp, 
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
import ReceitaModal from './ReceitaModal';

const ReceitasTab = ({ financeiroHook }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReceita, setSelectedReceita] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const { toast } = useToast();

  const receitas = financeiroHook.receitas.getAll();

  const categorias = [
    { value: 'vendas', label: 'Vendas' },
    { value: 'servicos', label: 'Serviços' },
    { value: 'juros', label: 'Juros' },
    { value: 'dividendos', label: 'Dividendos' },
    { value: 'aluguel', label: 'Aluguel' },
    { value: 'outras', label: 'Outras' }
  ];

  const receitasFiltradas = receitas.filter(receita => {
    if (filtroCategoria !== 'todas' && receita.categoria !== filtroCategoria) return false;
    if (filtroStatus !== 'todos' && receita.status !== filtroStatus) return false;
    if (searchTerm && !receita.descricao.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    if (dataInicio) {
      const dataReceita = new Date(receita.dataRecebimento || receita.data);
      if (dataReceita < new Date(dataInicio)) return false;
    }
    
    if (dataFim) {
      const dataReceita = new Date(receita.dataRecebimento || receita.data);
      if (dataReceita > new Date(dataFim)) return false;
    }
    
    return true;
  });

  const handleEditReceita = (receita) => {
    setSelectedReceita(receita);
    setShowModal(true);
  };

  const handleDeleteReceita = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      const success = await financeiroHook.receitas.delete(id);
      if (success) {
        toast({
          title: "Receita excluída",
          description: "A receita foi excluída com sucesso.",
        });
      }
    }
  };

  const handleExportarReceitas = () => {
    const dadosExport = receitasFiltradas.map(receita => ({
      data: new Date(receita.dataRecebimento || receita.data).toLocaleDateString('pt-BR'),
      descricao: receita.descricao,
      categoria: receita.categoria,
      valor: receita.valor,
      status: receita.status,
      formaPagamento: receita.formaPagamento,
      cliente: receita.cliente,
      observacoes: receita.observacoes
    }));

    const csv = [
      ['Data', 'Descrição', 'Categoria', 'Valor', 'Status', 'Forma Pagamento', 'Cliente', 'Observações'],
      ...dadosExport.map(item => [
        item.data,
        item.descricao,
        item.categoria,
        item.valor,
        item.status,
        item.formaPagamento,
        item.cliente,
        item.observacoes
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `receitas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'recebido':
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

  const totalReceitas = receitasFiltradas.reduce((total, receita) => total + receita.valor, 0);
  const receitasRecebidas = receitasFiltradas.filter(r => r.status === 'recebido').length;
  const receitasPendentes = receitasFiltradas.filter(r => r.status === 'pendente').length;
  const maiorReceita = Math.max(...receitasFiltradas.map(r => r.valor), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Receitas</h2>
          <p className="text-gray-600">Gerencie suas receitas e entradas</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Receita
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Receitas</p>
                <p className="text-xl font-bold text-green-700">
                  R$ {totalReceitas.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Recebidas</p>
                <p className="text-xl font-bold text-blue-700">{receitasRecebidas}</p>
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
                <p className="text-xl font-bold text-yellow-700">{receitasPendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Maior Receita</p>
                <p className="text-xl font-bold text-purple-700">
                  R$ {maiorReceita.toLocaleString('pt-BR')}
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
                placeholder="Buscar receitas..."
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
                  <SelectItem value="recebido">Recebido</SelectItem>
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
              <Button variant="outline" onClick={handleExportarReceitas}>
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Receitas */}
      <div className="space-y-4">
        {receitasFiltradas.map((receita, index) => (
          <motion.div
            key={receita.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{receita.descricao}</h3>
                      <Badge className={getStatusColor(receita.status)}>
                        {receita.status}
                      </Badge>
                      <Badge variant="outline">
                        {getCategoriaLabel(receita.categoria)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Valor:</span>
                        <span className="font-bold text-green-600 ml-2">
                          R$ {receita.valor.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Data:</span>
                        <span className="ml-2">
                          {new Date(receita.dataRecebimento || receita.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Forma Pagamento:</span>
                        <span className="ml-2">{receita.formaPagamento || 'Não informado'}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Cliente:</span>
                        <span className="ml-2">{receita.cliente || 'Não informado'}</span>
                      </div>
                    </div>
                    
                    {receita.observacoes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Observações:</span> {receita.observacoes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditReceita(receita)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReceita(receita.id)}
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

      {receitasFiltradas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma receita encontrada</h3>
            <p className="text-gray-600">Não há receitas que correspondam aos filtros aplicados.</p>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <ReceitaModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedReceita(null);
        }}
        receita={selectedReceita}
        onSave={async (receita) => {
          if (selectedReceita) {
            await financeiroHook.receitas.update(selectedReceita.id, receita);
          } else {
            await financeiroHook.criarReceita(receita);
          }
          setShowModal(false);
          setSelectedReceita(null);
        }}
        categorias={categorias}
        contasFinanceiras={financeiroHook.contasFinanceiras.getAll()}
      />
    </div>
  );
};

export default ReceitasTab;
