import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, PieChart, Target } from 'lucide-react';

const FinanceiroStats = ({ data, indicadores }) => {
  const stats = {
    totalReceitas: data.receitas?.reduce((total, r) => total + r.valor, 0) || 0,
    totalDespesas: data.despesas?.reduce((total, d) => total + d.valor, 0) || 0,
    saldoAtual: (data.contasFinanceiras || []).reduce((total, c) => total + (c.saldo || 0), 0),
    contasBancarias: data.contasFinanceiras?.length || 0,
    titulosReceberPendentes: data.titulosReceber?.filter(t => t.status === 'pendente').length || 0,
    titulosPagarPendentes: data.titulosPagar?.filter(t => t.status === 'pendente').length || 0
  };

  const resultadoLiquido = stats.totalReceitas - stats.totalDespesas;
  const margemLiquida = stats.totalReceitas > 0 ? (resultadoLiquido / stats.totalReceitas) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Estatísticas Financeiras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Receitas vs Despesas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-800">Total Receitas</p>
            </div>
            <p className="text-2xl font-bold text-green-700">
              R$ {stats.totalReceitas.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {data.receitas?.length || 0} lançamentos
            </p>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <p className="text-sm font-medium text-red-800">Total Despesas</p>
            </div>
            <p className="text-2xl font-bold text-red-700">
              R$ {stats.totalDespesas.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {data.despesas?.length || 0} lançamentos
            </p>
          </div>
        </div>

        {/* Resultado Líquido */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-gray-600" />
            <p className="text-sm font-medium text-gray-800">Resultado Líquido</p>
          </div>
          <p className={`text-2xl font-bold ${resultadoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {resultadoLiquido.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Margem: {margemLiquida.toFixed(1)}%
          </p>
        </div>

        {/* Contas Bancárias */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-medium text-blue-800">Saldo Total em Contas</p>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            R$ {stats.saldoAtual.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {stats.contasBancarias} contas cadastradas
          </p>
        </div>

        {/* Títulos Pendentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">Títulos a Receber</p>
            <p className="text-lg font-bold text-yellow-700">
              {stats.titulosReceberPendentes}
            </p>
            <p className="text-xs text-yellow-600">pendentes</p>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-sm font-medium text-orange-800">Títulos a Pagar</p>
            <p className="text-lg font-bold text-orange-700">
              {stats.titulosPagarPendentes}
            </p>
            <p className="text-xs text-orange-600">pendentes</p>
          </div>
        </div>

        {/* Análise de Tendência */}
        <div className="pt-4 border-t">
          <h4 className="font-medium text-gray-800 mb-3">Análise de Tendência</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Liquidez Atual</span>
              <span className="font-medium">{indicadores?.liquidezCorrente || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Margem Líquida</span>
              <span className={`font-medium ${margemLiquida >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {margemLiquida.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Situação</span>
              <span className={`font-medium ${resultadoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {resultadoLiquido >= 0 ? 'Positiva' : 'Negativa'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceiroStats;