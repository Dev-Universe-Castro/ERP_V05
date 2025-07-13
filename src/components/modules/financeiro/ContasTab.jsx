
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
  CreditCard, 
  Building, 
  DollarSign, 
  Eye, 
  EyeOff, 
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import ContaModal from './ContaModal';

const ContasTab = ({ financeiroHook, indicadores }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedConta, setSelectedConta] = useState(null);
  const [showSaldos, setShowSaldos] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const { toast } = useToast();

  const contas = financeiroHook.contasFinanceiras.getAll();

  const contasFiltradas = contas.filter(conta => {
    if (filtroTipo !== 'todos' && conta.tipo !== filtroTipo) return false;
    if (filtroStatus !== 'todos' && conta.status !== filtroStatus) return false;
    return true;
  });

  const handleEditConta = (conta) => {
    setSelectedConta(conta);
    setShowModal(true);
  };

  const handleConciliar = async (contaId) => {
    try {
      const resultado = await financeiroHook.conciliarConta(contaId, { saldoFinal: 0 });
      if (resultado) {
        toast({
          title: "Conciliação Realizada",
          description: `Conta conciliada com sucesso. Status: ${resultado.status}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro na Conciliação",
        description: "Não foi possível realizar a conciliação",
        variant: "destructive"
      });
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'corrente':
        return <CreditCard className="h-4 w-4" />;
      case 'poupanca':
        return <Building className="h-4 w-4" />;
      case 'investimento':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800';
      case 'inativa':
        return 'bg-red-100 text-red-800';
      case 'bloqueada':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSaldo = contasFiltradas.reduce((total, conta) => total + (conta.saldo || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contas Financeiras</h2>
          <p className="text-gray-600">Gerencie suas contas bancárias e saldos</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div className="w-48">
                <Label htmlFor="filtroTipo">Tipo de Conta</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="corrente">Conta Corrente</SelectItem>
                    <SelectItem value="poupanca">Poupança</SelectItem>
                    <SelectItem value="investimento">Investimento</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-48">
                <Label htmlFor="filtroStatus">Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="inativa">Inativa</SelectItem>
                    <SelectItem value="bloqueada">Bloqueada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaldos(!showSaldos)}
                className="flex items-center gap-2"
              >
                {showSaldos ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showSaldos ? 'Ocultar Saldos' : 'Mostrar Saldos'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Saldo Total</p>
                <p className="text-xl font-bold text-blue-700">
                  {showSaldos ? `R$ ${totalSaldo.toLocaleString('pt-BR')}` : '••••••'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Contas Ativas</p>
                <p className="text-xl font-bold text-green-700">
                  {contasFiltradas.filter(c => c.status === 'ativa').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Maior Saldo</p>
                <p className="text-xl font-bold text-purple-700">
                  {showSaldos ? `R$ ${Math.max(...contasFiltradas.map(c => c.saldo || 0)).toLocaleString('pt-BR')}` : '••••••'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Bancos</p>
                <p className="text-xl font-bold text-orange-700">
                  {new Set(contasFiltradas.map(c => c.banco)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contasFiltradas.map((conta, index) => (
          <motion.div
            key={conta.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {getTipoIcon(conta.tipo)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{conta.nome}</CardTitle>
                      <p className="text-sm text-gray-600">{conta.banco}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(conta.status)}>
                    {conta.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ag/Conta:</span>
                    <span className="font-medium">{conta.agencia}/{conta.conta}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Saldo:</span>
                    <span className={`font-bold text-lg ${(conta.saldo || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {showSaldos ? `R$ ${(conta.saldo || 0).toLocaleString('pt-BR')}` : '••••••'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <span className="font-medium capitalize">{conta.tipo}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Última Movimentação:</span>
                    <span className="text-sm">
                      {conta.ultimaMovimentacao ? 
                        new Date(conta.ultimaMovimentacao).toLocaleDateString('pt-BR') : 
                        'Nenhuma'
                      }
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditConta(conta)}
                      className="flex-1"
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleConciliar(conta.id)}
                      className="flex-1"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Conciliar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <ContaModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedConta(null);
        }}
        conta={selectedConta}
        onSave={(conta) => {
          if (selectedConta) {
            financeiroHook.contasFinanceiras.update(selectedConta.id, conta);
          } else {
            financeiroHook.contasFinanceiras.create(conta);
          }
          setShowModal(false);
          setSelectedConta(null);
        }}
      />
    </div>
  );
};

export default ContasTab;
