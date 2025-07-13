
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Filter, Download, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const FluxoTab = ({ financeiroHook }) => {
  const { data } = useData();
  const [periodo, setPeriodo] = useState('mes_atual');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [tipoVisao, setTipoVisao] = useState('consolidado');

  // Calcular dados do fluxo de caixa
  const fluxoCaixa = useMemo(() => {
    const hoje = new Date();
    let inicio, fim;

    switch (periodo) {
      case 'mes_atual':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        break;
      case 'mes_anterior':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        break;
      case 'trimestre':
        const trimestre = Math.floor(hoje.getMonth() / 3);
        inicio = new Date(hoje.getFullYear(), trimestre * 3, 1);
        fim = new Date(hoje.getFullYear(), (trimestre + 1) * 3, 0);
        break;
      case 'personalizado':
        inicio = new Date(dataInicio);
        fim = new Date(dataFim);
        break;
      default:
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    }

    // === ENTRADAS ===
    const receitas = data.receitas?.filter(r => {
      const dataReceita = new Date(r.dataRecebimento || r.data);
      return dataReceita >= inicio && dataReceita <= fim;
    }) || [];

    const titulosReceber = data.titulosReceber?.filter(t => {
      const dataVencimento = new Date(t.dataVencimento);
      return dataVencimento >= inicio && dataVencimento <= fim;
    }) || [];

    // Vendas realizadas (do módulo comercial)
    const vendasRealizadas = data.pedidosVenda?.filter(p => {
      const dataVenda = new Date(p.dataVenda || p.createdAt);
      return dataVenda >= inicio && dataVenda <= fim && p.status === 'finalizado';
    }) || [];

    // === SAÍDAS ===
    const despesas = data.despesas?.filter(d => {
      const dataDespesa = new Date(d.dataPagamento || d.data);
      return dataDespesa >= inicio && dataDespesa <= fim;
    }) || [];

    const titulosPagar = data.titulosPagar?.filter(t => {
      const dataVencimento = new Date(t.dataVencimento);
      return dataVencimento >= inicio && dataVencimento <= fim;
    }) || [];

    // Compras realizadas (do módulo compras)
    const comprasRealizadas = data.pedidosCompra?.filter(p => {
      const dataCompra = new Date(p.dataEnvio || p.createdAt);
      return dataCompra >= inicio && dataCompra <= fim && p.status === 'confirmado';
    }) || [];

    // Folha de pagamento (do módulo RH)
    const folhasPagamento = data.folhasPagamento?.filter(f => {
      const dataFolha = new Date(f.competencia || f.createdAt);
      return dataFolha >= inicio && dataFolha <= fim && f.status === 'aprovada';
    }) || [];

    // Calcular totais
    const entradas = {
      receitasRealizadas: receitas.reduce((total, r) => total + r.valor, 0),
      titulosReceber: titulosReceber.filter(t => t.status === 'pendente').reduce((total, t) => total + t.valor, 0),
      vendasPrevistas: vendasRealizadas.reduce((total, v) => total + (v.valorTotal || 0), 0),
      total: 0
    };
    entradas.total = entradas.receitasRealizadas + entradas.titulosReceber + entradas.vendasPrevistas;

    const saidas = {
      despesasRealizadas: despesas.reduce((total, d) => total + d.valor, 0),
      titulosPagar: titulosPagar.filter(t => t.status === 'pendente').reduce((total, t) => total + t.valor, 0),
      comprasPrevistas: comprasRealizadas.reduce((total, c) => total + (c.valorTotal || 0), 0),
      folhaPagamento: folhasPagamento.reduce((total, f) => total + (f.totalProventos || 0), 0),
      total: 0
    };
    saidas.total = saidas.despesasRealizadas + saidas.titulosPagar + saidas.comprasPrevistas + saidas.folhaPagamento;

    const resultado = entradas.total - saidas.total;

    // Projeção por dia
    const diasPeriodo = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
    const projecaoDiaria = {
      entradas: entradas.total / diasPeriodo,
      saidas: saidas.total / diasPeriodo,
      resultado: resultado / diasPeriodo
    };

    return {
      periodo: { inicio, fim },
      entradas,
      saidas,
      resultado,
      projecaoDiaria,
      detalhes: {
        receitas,
        despesas,
        titulosReceber,
        titulosPagar,
        comprasRealizadas,
        vendasRealizadas,
        folhasPagamento
      }
    };
  }, [data, periodo, dataInicio, dataFim]);

  const handleExportarFluxo = () => {
    const dadosExport = {
      periodo: `${fluxoCaixa.periodo.inicio.toLocaleDateString('pt-BR')} até ${fluxoCaixa.periodo.fim.toLocaleDateString('pt-BR')}`,
      entradas: fluxoCaixa.entradas,
      saidas: fluxoCaixa.saidas,
      resultado: fluxoCaixa.resultado,
      detalhes: fluxoCaixa.detalhes
    };

    const dataStr = JSON.stringify(dadosExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `fluxo_caixa_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros do Fluxo de Caixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="periodo">Período</Label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes_atual">Mês Atual</SelectItem>
                  <SelectItem value="mes_anterior">Mês Anterior</SelectItem>
                  <SelectItem value="trimestre">Trimestre Atual</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodo === 'personalizado' && (
              <>
                <div>
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="tipoVisao">Tipo de Visão</Label>
              <Select value={tipoVisao} onValueChange={setTipoVisao}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a visão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consolidado">Consolidado</SelectItem>
                  <SelectItem value="detalhado">Detalhado</SelectItem>
                  <SelectItem value="projecao">Projeção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleExportarFluxo} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visualizar Gráfico
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Entradas</p>
                  <p className="text-2xl font-bold text-green-700">
                    R$ {fluxoCaixa.entradas.total.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Média diária: R$ {fluxoCaixa.projecaoDiaria.entradas.toLocaleString('pt-BR')}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Total Saídas</p>
                  <p className="text-2xl font-bold text-red-700">
                    R$ {fluxoCaixa.saidas.total.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Média diária: R$ {fluxoCaixa.projecaoDiaria.saidas.toLocaleString('pt-BR')}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`bg-gradient-to-r ${fluxoCaixa.resultado >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-yellow-50 to-yellow-100 border-yellow-200'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${fluxoCaixa.resultado >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                    Resultado Líquido
                  </p>
                  <p className={`text-2xl font-bold ${fluxoCaixa.resultado >= 0 ? 'text-blue-700' : 'text-yellow-700'}`}>
                    R$ {fluxoCaixa.resultado.toLocaleString('pt-BR')}
                  </p>
                  <p className={`text-xs mt-1 ${fluxoCaixa.resultado >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                    Média diária: R$ {fluxoCaixa.projecaoDiaria.resultado.toLocaleString('pt-BR')}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${fluxoCaixa.resultado >= 0 ? 'text-blue-600' : 'text-yellow-600'}`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detalhamento das Entradas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <TrendingUp className="h-5 w-5" />
            Detalhamento das Entradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Receitas Realizadas</h4>
              <p className="text-2xl font-bold text-green-700">
                R$ {fluxoCaixa.entradas.receitasRealizadas.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-green-600">
                {fluxoCaixa.detalhes.receitas.length} transações
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">Títulos a Receber</h4>
              <p className="text-2xl font-bold text-blue-700">
                R$ {fluxoCaixa.entradas.titulosReceber.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-blue-600">
                {fluxoCaixa.detalhes.titulosReceber.filter(t => t.status === 'pendente').length} pendentes
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800">Vendas Previstas</h4>
              <p className="text-2xl font-bold text-purple-700">
                R$ {fluxoCaixa.entradas.vendasPrevistas.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-purple-600">
                {fluxoCaixa.detalhes.vendasRealizadas.length} vendas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento das Saídas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <TrendingDown className="h-5 w-5" />
            Detalhamento das Saídas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-800">Despesas Realizadas</h4>
              <p className="text-2xl font-bold text-red-700">
                R$ {fluxoCaixa.saidas.despesasRealizadas.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-red-600">
                {fluxoCaixa.detalhes.despesas.length} transações
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-800">Títulos a Pagar</h4>
              <p className="text-2xl font-bold text-orange-700">
                R$ {fluxoCaixa.saidas.titulosPagar.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-orange-600">
                {fluxoCaixa.detalhes.titulosPagar.filter(t => t.status === 'pendente').length} pendentes
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800">Compras Previstas</h4>
              <p className="text-2xl font-bold text-yellow-700">
                R$ {fluxoCaixa.saidas.comprasPrevistas.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-yellow-600">
                {fluxoCaixa.detalhes.comprasRealizadas.length} compras
              </p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-800">Folha de Pagamento</h4>
              <p className="text-2xl font-bold text-indigo-700">
                R$ {fluxoCaixa.saidas.folhaPagamento.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-indigo-600">
                {fluxoCaixa.detalhes.folhasPagamento.length} folhas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visão Detalhada */}
      {tipoVisao === 'detalhado' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Transações de Entrada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {fluxoCaixa.detalhes.receitas.map((receita, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{receita.descricao}</p>
                      <p className="text-xs text-gray-600">{receita.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">R$ {receita.valor.toLocaleString('pt-BR')}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(receita.dataRecebimento || receita.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">Transações de Saída</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {fluxoCaixa.detalhes.despesas.map((despesa, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{despesa.descricao}</p>
                      <p className="text-xs text-gray-600">{despesa.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-700">R$ {despesa.valor.toLocaleString('pt-BR')}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(despesa.dataPagamento || despesa.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FluxoTab;
