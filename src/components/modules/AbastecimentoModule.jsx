"use client"

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Fuel, Plus, Search, Filter, Eye, Edit, Trash2, 
  Car, Wrench, AlertTriangle, CheckCircle, Clock, DollarSign,
  FileText, Download, Calendar, TrendingUp, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useAbastecimento } from '@/hooks/useAbastecimento';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useData } from '@/contexts/DataContext';
import { useWorkflow } from '@/hooks/useWorkflow';
import AbastecimentoSidebar from './abastecimento/AbastecimentoSidebar';
import AbastecimentoStats from './abastecimento/AbastecimentoStats';
import CompliancePanel from '../common/CompliancePanel';
import WorkflowSteps from '../common/WorkflowSteps';
import * as XLSX from 'xlsx';

const EquipamentosTable = ({ equipamentos, onEdit, onDelete, onView }) => (
  <div className="data-table rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Código</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nome</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Medidor Atual</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Unidade</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Consumo Médio</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {equipamentos.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm text-gray-800 font-mono">{item.codigo}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.nome}</td>
              <td className="px-4 py-3 text-sm text-gray-600 capitalize">{item.tipo}</td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">
                {new Intl.NumberFormat('pt-BR').format(item.medidorAtual)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{item.medidor}</td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                {item.consumoMedio.toFixed(1)} {item.medidor}/L
              </td>
              <td className="px-4 py-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.status === 'ativo' ? 'bg-green-100 text-green-800' :
                  item.status === 'manutencao' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
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

const AbastecimentosTable = ({ abastecimentos, onEdit, onDelete, onView }) => (
  <div className="data-table rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Equipamento</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Litros</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Preço/L</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Total</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Medidor Anterior</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Medidor Atual</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Consumo</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Posto</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {abastecimentos.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm text-gray-800">
                {new Date(item.data).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.equipamento}</td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">
                {item.litros.toFixed(1)}L
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 text-right">
                R$ {(item.valor / item.litros).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">
                R$ {item.valor.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 text-right">
                {new Intl.NumberFormat('pt-BR').format(item.medidorAnterior)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">
                {new Intl.NumberFormat('pt-BR').format(item.medidorAtual)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                {item.consumo.toFixed(2)} {item.tipoMedidor}/L
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{item.posto || 'N/A'}</td>
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

const ConsumoAnalysis = ({ equipamentos, abastecimentos }) => {
  const analiseConsumo = useMemo(() => {
    return equipamentos.map(eq => {
      const abastEq = abastecimentos.filter(ab => ab.equipamentoId === eq.id);
      const totalLitros = abastEq.reduce((acc, ab) => acc + ab.litros, 0);
      const totalValor = abastEq.reduce((acc, ab) => acc + ab.valor, 0);

      let totalPercorrido = 0;
      if (abastEq.length > 0) {
        const abastOrdenados = abastEq.sort((a, b) => new Date(a.data) - new Date(b.data));
        totalPercorrido = abastOrdenados[abastOrdenados.length - 1].medidorAtual - abastOrdenados[0].medidorAnterior;
      }

      const consumoReal = totalLitros > 0 ? totalPercorrido / totalLitros : 0;
      const eficiencia = eq.consumoMedio > 0 ? (consumoReal / eq.consumoMedio) * 100 : 0;
      const custoMedio = totalLitros > 0 ? totalValor / totalLitros : 0;

      return {
        ...eq,
        totalAbastecimentos: abastEq.length,
        totalLitros,
        totalValor,
        totalPercorrido,
        consumoReal,
        eficiencia,
        custoMedio,
        status: eficiencia > 90 ? 'excelente' : eficiencia > 70 ? 'bom' : 'atencao'
      };
    });
  }, [equipamentos, abastecimentos]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Equipamentos Eficientes</p>
                <p className="text-2xl font-bold text-green-600">
                  {analiseConsumo.filter(eq => eq.status === 'excelente').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Precisam Atenção</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {analiseConsumo.filter(eq => eq.status === 'atencao').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Consumo Total (L)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analiseConsumo.reduce((acc, eq) => acc + eq.totalLitros, 0).toFixed(0)}
                </p>
              </div>
              <Fuel className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gasto Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {analiseConsumo.reduce((acc, eq) => acc + eq.totalValor, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise de Eficiência por Equipamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Equipamento</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Abastecimentos</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Total Litros</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Gasto Total</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Custo Médio/L</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Consumo Real</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Consumo Esperado</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Eficiência</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analiseConsumo.map(eq => (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{eq.nome}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right">{eq.totalAbastecimentos}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right">{eq.totalLitros.toFixed(1)}L</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right">R$ {eq.totalValor.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right">R$ {eq.custoMedio.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right">{eq.consumoReal.toFixed(1)} {eq.medidor}/L</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{eq.consumoMedio.toFixed(1)} {eq.medidor}/L</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">{eq.eficiencia.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        eq.status === 'excelente' ? 'bg-green-100 text-green-800' :
                        eq.status === 'bom' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {eq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const RelatoriosSection = ({ equipamentos, abastecimentos }) => {
  const [filtroData, setFiltroData] = useState('mes');
  const [filtroEquipamento, setFiltroEquipamento] = useState('todos');

  const dadosRelatorio = useMemo(() => {
    const dataLimite = new Date();
    if (filtroData === 'semana') dataLimite.setDate(dataLimite.getDate() - 7);
    else if (filtroData === 'mes') dataLimite.setMonth(dataLimite.getMonth() - 1);
    else if (filtroData === 'trimestre') dataLimite.setMonth(dataLimite.getMonth() - 3);
    else if (filtroData === 'ano') dataLimite.setFullYear(dataLimite.getFullYear() - 1);

    let abastecimentosFiltrados = abastecimentos.filter(ab => 
      new Date(ab.data) >= dataLimite
    );

    if (filtroEquipamento !== 'todos') {
      abastecimentosFiltrados = abastecimentosFiltrados.filter(ab => 
        ab.equipamentoId === parseInt(filtroEquipamento)
      );
    }

    const totalLitros = abastecimentosFiltrados.reduce((acc, ab) => acc + ab.litros, 0);
    const totalValor = abastecimentosFiltrados.reduce((acc, ab) => acc + ab.valor, 0);
    const mediaConsumo = abastecimentosFiltrados.length > 0 ? 
      abastecimentosFiltrados.reduce((acc, ab) => acc + ab.consumo, 0) / abastecimentosFiltrados.length : 0;

    return {
      totalAbastecimentos: abastecimentosFiltrados.length,
      totalLitros,
      totalValor,
      mediaConsumo,
      custoMedioLitro: totalLitros > 0 ? totalValor / totalLitros : 0,
      abastecimentos: abastecimentosFiltrados
    };
  }, [abastecimentos, filtroData, filtroEquipamento]);

  const exportarRelatorio = () => {
    const dados = dadosRelatorio.abastecimentos.map(ab => {
      const equipamento = equipamentos.find(eq => eq.id === ab.equipamentoId);
      return {
        Data: new Date(ab.data).toLocaleDateString('pt-BR'),
        Equipamento: equipamento?.nome || 'N/A',
        'Código Equipamento': equipamento?.codigo || 'N/A',
        'Litros Abastecidos': ab.litros,
        'Preço por Litro': (ab.valor / ab.litros).toFixed(2),
        'Valor Total': ab.valor,
        'Medidor Anterior': ab.medidorAnterior,
        'Medidor Atual': ab.medidorAtual,
        'Distância Percorrida': ab.medidorAtual - ab.medidorAnterior,
        'Consumo (km/L)': ab.consumo.toFixed(2),
        'Posto': ab.posto || 'N/A'
      };
    });

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório Abastecimento');
    XLSX.writeFile(wb, `relatorio_abastecimento_${filtroData}_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Relatório exportado",
      description: "Relatório de abastecimento exportado com sucesso."
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
          <Label>Equipamento</Label>
          <Select value={filtroEquipamento} onValueChange={setFiltroEquipamento}>
            <SelectTrigger className="w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os equipamentos</SelectItem>
              {equipamentos.map(eq => (
                <SelectItem key={eq.id} value={eq.id.toString()}>
                  {eq.codigo} - {eq.nome}
                </SelectItem>
              ))}
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Abastecimentos</p>
                <p className="text-2xl font-bold text-gray-800">{dadosRelatorio.totalAbastecimentos}</p>
              </div>
              <Fuel className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Litros</p>
                <p className="text-2xl font-bold text-gray-800">{dadosRelatorio.totalLitros.toFixed(0)}L</p>
              </div>
              <Fuel className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gasto Total</p>
                <p className="text-2xl font-bold text-gray-800">R$ {dadosRelatorio.totalValor.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Custo Médio/L</p>
                <p className="text-2xl font-bold text-gray-800">R$ {dadosRelatorio.custoMedioLitro.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Abastecimentos - {filtroData}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Equipamento</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Litros</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Preço/L</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Valor Total</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Consumo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Posto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dadosRelatorio.abastecimentos.map(ab => {
                  const equipamento = equipamentos.find(eq => eq.id === ab.equipamentoId);
                  return (
                    <tr key={ab.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Date(ab.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{equipamento?.nome}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-right">{ab.litros.toFixed(1)}L</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        R$ {(ab.valor / ab.litros).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-right">R$ {ab.valor.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-right">{ab.consumo.toFixed(1)} {equipamento?.medidor || 'km'}/L</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ab.posto || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AlertasSection = ({ equipamentos, abastecimentos }) => {
  const alertas = useMemo(() => {
    const alerts = [];

    // Alertas de manutenção baseados na quilometragem
    equipamentos.forEach(eq => {
      if (eq.medidor === 'km') {
        const proximaManutencao = Math.ceil(eq.medidorAtual / 10000) * 10000;
        const faltam = proximaManutencao - eq.medidorAtual;

        if (faltam <= 1000) {
          alerts.push({
            id: `manutencao_${eq.id}`,
            tipo: 'manutencao',
            equipamento: eq.nome,
            codigo: eq.codigo,
            mensagem: `Manutenção preventiva em ${faltam} ${eq.medidor}`,
            prioridade: faltam <= 500 ? 'alta' : 'media',
            data: new Date()
          });
        }
      } else if (eq.medidor === 'horas') {
        const proximaManutencao = Math.ceil(eq.medidorAtual / 250) * 250;
        const faltam = proximaManutencao - eq.medidorAtual;

        if (faltam <= 50) {
          alerts.push({
            id: `manutencao_${eq.id}`,
            tipo: 'manutencao',
            equipamento: eq.nome,
            codigo: eq.codigo,
            mensagem: `Manutenção preventiva em ${faltam} ${eq.medidor}`,
            prioridade: faltam <= 25 ? 'alta' : 'media',
            data: new Date()
          });
        }
      }
    });

    // Alertas de consumo elevado
    equipamentos.forEach(eq => {
      const abastEq = abastecimentos.filter(ab => ab.equipamentoId === eq.id);
      if (abastEq.length >= 3) {
        const ultimosConsumos = abastEq.slice(-3).map(ab => ab.consumo);
        const mediaRecente = ultimosConsumos.reduce((a, b) => a + b, 0) / ultimosConsumos.length;

        if (mediaRecente < eq.consumoMedio * 0.8) {
          alerts.push({
            id: `consumo_${eq.id}`,
            tipo: 'consumo',
            equipamento: eq.nome,
            codigo: eq.codigo,
            mensagem: `Consumo elevado detectado (${mediaRecente.toFixed(1)} vs ${eq.consumoMedio.toFixed(1)} ${eq.medidor}/L)`,
            prioridade: 'alta',
            data: new Date()
          });
        }
      }
    });

    // Alertas de equipamentos sem abastecimento recente
    equipamentos.forEach(eq => {
      const ultimoAbast = abastecimentos
        .filter(ab => ab.equipamentoId === eq.id)
        .sort((a, b) => new Date(b.data) - new Date(a.data))[0];

      if (ultimoAbast) {
        const diasSemAbast = Math.floor((new Date() - new Date(ultimoAbast.data)) / (1000 * 60 * 60 * 24));
        if (diasSemAbast > 30) {
          alerts.push({
            id: `sem_abast_${eq.id}`,
            tipo: 'sem_abastecimento',
            equipamento: eq.nome,
            codigo: eq.codigo,
            mensagem: `Sem abastecimento há ${diasSemAbast} dias`,
            prioridade: diasSemAbast > 60 ? 'alta' : 'media',
            data: new Date()
          });
        }
      }
    });

    // Alertas de custo elevado
    equipamentos.forEach(eq => {
      const abastEq = abastecimentos.filter(ab => ab.equipamentoId === eq.id);
      if (abastEq.length >= 3) {
        const ultimosAbast = abastEq.slice(-3);
        const custosRecentes = ultimosAbast.map(ab => ab.valor / ab.litros);
        const custoMedio = custosRecentes.reduce((a, b) => a + b, 0) / custosRecentes.length;

        const mediaGeral = abastEq.reduce((acc, ab) => acc + (ab.valor / ab.litros), 0) / abastEq.length;

        if (custoMedio > mediaGeral * 1.15) {
          alerts.push({
            id: `custo_${eq.id}`,
            tipo: 'custo',
            equipamento: eq.nome,
            codigo: eq.codigo,
            mensagem: `Custo por litro acima da média (R$ ${custoMedio.toFixed(2)} vs R$ ${mediaGeral.toFixed(2)})`,
            prioridade: 'media',
            data: new Date()
          });
        }
      }
    });

    return alerts.sort((a, b) => {
      const prioridadeOrder = { alta: 3, media: 2, baixa: 1 };
      return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
    });
  }, [equipamentos, abastecimentos]);

  const getIconeAlerta = (tipo) => {
    switch (tipo) {
      case 'manutencao': return <Clock className="h-5 w-5" />;
      case 'consumo': return <TrendingUp className="h-5 w-5" />;
      case 'sem_abastecimento': return <Fuel className="h-5 w-5" />;
      case 'custo': return <DollarSign className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Alertas Críticos</p>
                <p className="text-2xl font-bold text-red-600">
                  {alertas.filter(a => a.prioridade === 'alta').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Alertas Médios</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alertas.filter(a => a.prioridade === 'media').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Alertas</p>
                <p className="text-2xl font-bold text-gray-800">{alertas.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Central de Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          {alertas.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum alerta ativo no momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertas.map(alerta => (
                <div
                  key={alerta.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alerta.prioridade === 'alta' 
                      ? 'border-red-500 bg-red-50' 
                      : alerta.prioridade === 'media'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${
                        alerta.prioridade === 'alta' ? 'text-red-600' :
                        alerta.prioridade === 'media' ? 'text-yellow-600' : 'text-blue-600'
                      }`}>
                        {getIconeAlerta(alerta.tipo)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {alerta.codigo} - {alerta.equipamento}
                        </h4>
                        <p className="text-gray-600">{alerta.mensagem}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {alerta.data.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alerta.prioridade === 'alta' 
                        ? 'bg-red-100 text-red-800' 
                        : alerta.prioridade === 'media'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {alerta.prioridade.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const AbastecimentoModal = ({ isOpen, onClose, tipo, equipamentos, onSave, editData, isEdit = false }) => {
  const [formData, setFormData] = useState(() => {
    if (isEdit && editData) {
      if (tipo === 'equipamentos') {
        return {
          nome: editData.nome || '',
          tipo: editData.tipo || 'veiculo',
          medidorAtual: editData.medidorAtual?.toString() || '',
          medidor: editData.medidor || 'km',
          consumoMedio: editData.consumoMedio?.toString() || '',
          status: editData.status || 'ativo'
        };
      } else {
        return {
          equipamentoId: editData.equipamentoId?.toString() || '',
          data: editData.data ? editData.data.split('T')[0] : new Date().toISOString().split('T')[0],
          litros: editData.litros?.toString() || '',
          valor: editData.valor?.toString() || '',
          medidorAtual: editData.medidorAtual?.toString() || '',
          posto: editData.posto || ''
        };
      }
    }

    return tipo === 'equipamentos' 
      ? {
          nome: '',
          tipo: 'veiculo',
          medidorAtual: '',
          medidor: 'km',
          consumoMedio: '',
          status: 'ativo'
        }
      : {
          equipamentoId: '',
          data: new Date().toISOString().split('T')[0],
          litros: '',
          valor: '',
          medidorAtual: '',
          posto: ''
        };
  });

  const equipamentoSelecionado = equipamentos.find(eq => eq.id === parseInt(formData.equipamentoId));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (tipo === 'equipamentos') {
      if (formData.nome && formData.medidorAtual && formData.consumoMedio) {
        onSave({
          ...formData,
          medidorAtual: parseFloat(formData.medidorAtual),
          consumoMedio: parseFloat(formData.consumoMedio)
        });
      } else {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios.",
          variant: "destructive"
        });
      }
    } else {
      if (formData.equipamentoId && formData.litros && formData.valor && formData.medidorAtual) {
        onSave({
          ...formData,
          equipamentoId: parseInt(formData.equipamentoId),
          litros: parseFloat(formData.litros),
          valor: parseFloat(formData.valor),
          medidorAtual: parseFloat(formData.medidorAtual)
        });
      } else {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios.",
          variant: "destructive"
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {isEdit ? 'Editar' : 'Novo'} {tipo === 'equipamentos' ? 'Equipamento' : 'Abastecimento'}
            </span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {tipo === 'equipamentos' ? (
              <>
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Nome do equipamento"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veiculo">Veículo</SelectItem>
                      <SelectItem value="maquina">Máquina</SelectItem>
                      <SelectItem value="equipamento">Equipamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="medidorAtual">Medidor Atual *</Label>
                  <Input
                    id="medidorAtual"
                    type="number"
                    value={formData.medidorAtual}
                    onChange={(e) => setFormData({...formData, medidorAtual: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="medidor">Unidade Medidor</Label>
                  <Select value={formData.medidor} onValueChange={(value) => setFormData({...formData, medidor: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km">Quilômetros</SelectItem>
                      <SelectItem value="horas">Horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="consumoMedio">Consumo Médio * ({formData.medidor}/L)</Label>
                  <Input
                    id="consumoMedio"
                    type="number"
                    step="0.1"
                    value={formData.consumoMedio}
                    onChange={(e) => setFormData({...formData, consumoMedio: e.target.value})}
                    placeholder="0.0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="manutencao">Em Manutenção</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="equipamento">Equipamento *</Label>
                  <Select value={formData.equipamentoId} onValueChange={(value) => setFormData({...formData, equipamentoId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipamentos.filter(eq => eq.status === 'ativo').map(eq => (
                        <SelectItem key={eq.id} value={eq.id.toString()}>
                          {eq.codigo} - {eq.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {equipamentoSelecionado && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Medidor atual:</strong> {new Intl.NumberFormat('pt-BR').format(equipamentoSelecionado.medidorAtual)} {equipamentoSelecionado.medidor}
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({...formData, data: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="litros">Litros Abastecidos *</Label>
                  <Input
                    id="litros"
                    type="number"
                    step="0.1"
                    value={formData.litros}
                    onChange={(e) => setFormData({...formData, litros: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valor">Valor Total Pago *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="medidorAtual">Medidor Após Abastecimento *</Label>
                  <Input
                    id="medidorAtual"
                    type="number"
                    value={formData.medidorAtual}
                    onChange={(e) => setFormData({...formData, medidorAtual: e.target.value})}
                    placeholder={equipamentoSelecionado ? `Atual: ${equipamentoSelecionado.medidorAtual}` : ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="posto">Posto de Combustível</Label>
                  <Input
                    id="posto"
                    value={formData.posto}
                    onChange={(e) => setFormData({...formData, posto: e.target.value})}
                    placeholder="Nome do posto"
                  />
                </div>

                {formData.litros && formData.valor && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Preço por litro:</strong> R$ {(parseFloat(formData.valor) / parseFloat(formData.litros)).toFixed(2)}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {isEdit ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const DetalhesModal = ({ isOpen, onClose, item, tipo, equipamentos }) => {
  if (!isOpen || !item) return null;

  const equipamento = tipo === 'abastecimentos' 
    ? equipamentos.find(eq => eq.id === item.equipamentoId)
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Detalhes do {tipo === 'equipamentos' ? 'Equipamento' : 'Abastecimento'}
            </span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tipo === 'equipamentos' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Código</Label>
                  <p className="text-gray-800 font-mono">{item.codigo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nome</Label>
                  <p className="text-gray-800">{item.nome}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tipo</Label>
                  <p className="text-gray-800 capitalize">{item.tipo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'ativo' ? 'bg-green-100 text-green-800' :
                    item.status === 'manutencao' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Medidor Atual</Label>
                  <p className="text-gray-800 font-semibold">
                    {new Intl.NumberFormat('pt-BR').format(item.medidorAtual)} {item.medidor}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Consumo Médio</Label>
                  <p className="text-gray-800">{item.consumoMedio.toFixed(1)} {item.medidor}/L</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Data</Label>
                  <p className="text-gray-800">{new Date(item.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Equipamento</Label>
                  <p className="text-gray-800">{equipamento?.nome || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Litros</Label>
                  <p className="text-gray-800 font-semibold">{item.litros.toFixed(1)}L</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Preço/L</Label>
                  <p className="text-gray-800">R$ {(item.valor / item.litros).toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Valor Total</Label>
                  <p className="text-gray-800 font-semibold">R$ {item.valor.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Medidor Anterior</Label>
                  <p className="text-gray-800">{new Intl.NumberFormat('pt-BR').format(item.medidorAnterior)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Medidor Atual</Label>
                  <p className="text-gray-800 font-semibold">{new Intl.NumberFormat('pt-BR').format(item.medidorAtual)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Percorrido</Label>
                  <p className="text-gray-800">{(item.medidorAtual - item.medidorAnterior).toFixed(0)} {equipamento?.medidor}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Consumo</Label>
                  <p className="text-gray-800 font-semibold">{item.consumo.toFixed(2)} {equipamento?.medidor}/L</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Posto</Label>
                  <p className="text-gray-800">{item.posto || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const BarChart3 = () => {
  return null;
}



// Regras de compliance para abastecimento
const complianceRules = [
  {
    id: 'fuel_controls',
    name: 'Controles de Combustível',
    description: 'Registros de abastecimento completos e auditáveis',
    category: 'Governança'
  },
  {
    id: 'vehicle_maintenance',
    name: 'Manutenção Preventiva',
    description: 'Cronograma de manutenção em dia',
    category: 'Operacional'
  },
  {
    id: 'consumption_monitoring',
    name: 'Monitoramento de Consumo',
    description: 'Análise de eficiência combustível',
    category: 'Controle'
  },
  {
    id: 'cost_control',
    name: 'Controle de Custos',
    description: 'Monitoramento de gastos com combustível',
    category: 'Financeiro'
  },
  {
    id: 'fleet_compliance',
    name: 'Conformidade da Frota',
    description: 'Documentação e licenças em dia',
    category: 'Regulatório'
  }
];

export default function AbastecimentoModule({ activeSection, onSectionChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemEdit, setItemEdit] = useState(null);
  const [itemDetalhes, setItemDetalhes] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const abastecimento = useAbastecimento();
  const { logAction } = useAuditLog();
  const { executeWorkflow, getActiveWorkflows } = useWorkflow();
  const { searchItems } = useData();

  // Buscar dados reais
  const data = {
    equipamentos: abastecimento.equipamentos.getAll(),
    abastecimentos: abastecimento.abastecimentos.getAll(),
    manutencoes: abastecimento.manutencoes.getAll()
  };

  const { equipamentos, abastecimentos, manutencoes } = data;

  const abastecimentosComEquipamentos = useMemo(() => {
    return abastecimentos.map(abast => {
      const equipamento = equipamentos.find(eq => eq.id === abast.equipamentoId);
      return {
        ...abast,
        equipamento: equipamento?.nome || 'Equipamento não encontrado',
        tipoMedidor: equipamento?.medidor || 'km'
      };
    });
  }, [abastecimentos, equipamentos]);

  const filteredEquipamentos = useMemo(() => equipamentos.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ), [equipamentos, searchTerm]);

  const filteredAbastecimentos = useMemo(() => abastecimentosComEquipamentos.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ), [abastecimentosComEquipamentos, searchTerm]);

  const stats = useMemo(() => {
    const totalEquipamentos = equipamentos.length;
    const equipamentosAtivos = equipamentos.filter(eq => eq.status === 'ativo').length;
    const totalAbastecimentos = abastecimentos.length;
    const totalLitros = abastecimentos.reduce((acc, item) => acc + item.litros, 0);
    const totalGastos = abastecimentos.reduce((acc, item) => acc + item.valor, 0);
    const consumoMedio = abastecimentos.length > 0 ? 
      abastecimentos.reduce((acc, item) => acc + item.consumo, 0) / abastecimentos.length : 0;

    return { 
      totalEquipamentos, 
      equipamentosAtivos,
      totalAbastecimentos, 
      totalLitros, 
      totalGastos, 
      consumoMedio 
    };
  }, [equipamentos, abastecimentos]);

  const exportToExcel = () => {
    let dataToExport, filename;

    if (activeSection === 'equipamentos') {
      dataToExport = equipamentos.map(item => ({
        Código: item.codigo,
        Nome: item.nome,
        Tipo: item.tipo,
        'Medidor Atual': item.medidorAtual,
        'Unidade Medidor': item.medidor,
        'Consumo Médio': item.consumoMedio,
        Status: item.status
      }));
      filename = `equipamentos_${new Date().toISOString().split('T')[0]}.xlsx`;
    } else {
      dataToExport = abastecimentosComEquipamentos.map(item => ({
        Data: new Date(item.data).toLocaleDateString('pt-BR'),
        Equipamento: item.equipamento,
        'Litros Abastecidos': item.litros,
        'Preço por Litro': (item.valor / item.litros).toFixed(2),
        'Valor Total': item.valor,
        'Medidor Anterior': item.medidorAnterior,
        'Medidor Atual': item.medidorAtual,
        'Distância Percorrida': item.medidorAtual - item.medidorAnterior,
        Consumo: item.consumo.toFixed(2),
        Unidade: item.tipoMedidor,
        Posto: item.posto || 'N/A'
      }));
      filename = `abastecimentos_${new Date().toISOString().split('T')[0]}.xlsx`;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeSection);
    XLSX.writeFile(wb, filename);

    toast({
      title: "Exportação concluída",
      description: `Relatório de ${activeSection} exportado com sucesso.`
    });
  };

  const handleNovo = () => {
    setItemEdit(null);
    setIsEdit(false);
    setModalType(activeSection);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setItemEdit(item);
    setIsEdit(true);
    setModalType(activeSection);
    setShowModal(true);
  };

  const handleView = (item) => {
    setItemDetalhes(item);
    setShowDetalhesModal(true);
  };

  const handleDelete = async (item) => {
    if (confirm(`Deseja realmente excluir ${activeSection === 'equipamentos' ? 'o equipamento' : 'o abastecimento'}?`)) {
      try {
        setLoading(true);

        if (activeSection === 'equipamentos') {
          // Verificar se há abastecimentos para este equipamento
          const abastecimentosEquipamento = abastecimentos.filter(ab => ab.equipamentoId === item.id);
          if (abastecimentosEquipamento.length > 0) {
            toast({
              title: "Não é possível excluir",
              description: "Este equipamento possui abastecimentos registrados.",
              variant: "destructive"
            });
            return;
          }

          abastecimento.equipamentos.delete(item.id);
        } else {
          abastecimento.abastecimentos.delete(item.id);
        }

        // Log da ação
        logAction('DELETE', activeSection.toUpperCase(), item.id, 
          `${activeSection === 'equipamentos' ? 'Equipamento' : 'Abastecimento'} excluído`);

      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSalvar = async (dados) => {
    try {
      setLoading(true);

      if (activeSection === 'equipamentos') {
        if (isEdit) {
          abastecimento.equipamentos.update(itemEdit.id, dados);
        } else {
          const novoEquipamento = {
            codigo: `EQ${String(Date.now()).slice(-3)}`,
            ...dados,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          abastecimento.equipamentos.create(novoEquipamento);
        }
      } else {
        if (isEdit) {
          abastecimento.atualizarAbastecimento(itemEdit.id, dados);
        } else {
          const novoAbastecimento = abastecimento.criarAbastecimento(dados);

          // Executar workflow de validação se configurado
          const workflows = getActiveWorkflows('abastecimento_validation');
          for (const workflow of workflows) {
            await executeWorkflow(workflow.id, {
              tipo: 'abastecimento',
              dados: novoAbastecimento,
              equipamento: equipamentos.find(eq => eq.id === dados.equipamentoId)
            });
          }
        }
      }

      setShowModal(false);
      setItemEdit(null);
      setIsEdit(false);

    } catch (error) {
      // Erro já tratado nos hooks
    } finally {
      setLoading(false);
    }
  };

  const sectionTitle = {
    equipamentos: 'Equipamentos',
    abastecimentos: 'Abastecimentos',
    consumo: 'Análise de Consumo',
    relatorios: 'Relatórios',
    alertas: 'Alertas'
  }[activeSection];

  const renderContent = () => {
    switch (activeSection) {
      case 'equipamentos':
        return filteredEquipamentos.length > 0 ? (
          <EquipamentosTable 
            equipamentos={filteredEquipamentos} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{searchTerm ? 'Nenhum equipamento encontrado' : 'Nenhum equipamento cadastrado'}</p>
          </div>
        );

      case 'abastecimentos':
        return filteredAbastecimentos.length > 0 ? (
          <AbastecimentosTable 
            abastecimentos={filteredAbastecimentos}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <div className="text-center py-12">
            <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{searchTerm ? 'Nenhum abastecimento encontrado' : 'Nenhum abastecimento registrado'}</p>
          </div>
        );

      case 'consumo':
        return <ConsumoAnalysis equipamentos={equipamentos} abastecimentos={abastecimentos} />;

      case 'relatorios':
        return <RelatoriosSection equipamentos={equipamentos} abastecimentos={abastecimentos} />;

      case 'alertas':
        return <AlertasSection equipamentos={equipamentos} abastecimentos={abastecimentos} />;

      default:
        return <EquipamentosTable equipamentos={filteredEquipamentos} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />;
    }
  };

  const showSearchAndNew = ['equipamentos', 'abastecimentos'].includes(activeSection);

  const sections = [
    { id: 'equipamentos', label: 'Equipamentos', icon: Car },
    { id: 'abastecimentos', label: 'Abastecimentos', icon: Fuel },
    { id: 'consumo', label: 'Consumo', icon: Fuel },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    { id: 'alertas', label: 'Alertas', icon: AlertTriangle }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{sectionTitle}</h2>
          <p className="text-gray-500">Controle completo de frota e combustível</p>
        </div>
        {showSearchAndNew && (
          <div className="flex items-center space-x-3">
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar XLSX
            </Button>
            <Button onClick={handleNovo} className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              {activeSection === 'equipamentos' ? 'Novo Equipamento' : 'Novo Abastecimento'}
            </Button>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      {activeSection === 'equipamentos' && (
        <AbastecimentoStats equipamentos={equipamentos} abastecimentos={abastecimentos} />
      )}

      {/* Painel de Compliance */}
      <CompliancePanel rules={complianceRules} data={data} />

      {/* Workflows Ativos */}
      <WorkflowSteps 
        activeWorkflows={getActiveWorkflows('abastecimento')}
        onExecuteStep={(workflowId, stepId, data) => executeWorkflow(workflowId, data)}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Equipamentos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalEquipamentos}</p>
              <p className="text-xs text-gray-500">{stats.equipamentosAtivos} ativos</p>
            </div>
            <Truck className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Abastecimentos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalAbastecimentos}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Litros</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalLitros.toFixed(0)}L</p>
            </div>
            <Fuel className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Gastos Totais</p>
              <p className="text-2xl font-bold text-gray-800">R$ {stats.totalGastos.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      {showSearchAndNew && (
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Buscar ${activeSection}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-800">{sectionTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      {/* Modais */}
      <AbastecimentoModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setItemEdit(null);
          setIsEdit(false);
        }}
        tipo={activeSection}
        equipamentos={equipamentos}
        onSave={handleSalvar}
        editData={itemEdit}
        isEdit={isEdit}
      />

      <DetalhesModal
        isOpen={showDetalhesModal}
        onClose={() => {
          setShowDetalhesModal(false);
          setItemDetalhes(null);
        }}
        item={itemDetalhes}
        tipo={activeSection}
        equipamentos={equipamentos}
      />
    </div>
  );
}

AbastecimentoModule.Sidebar = AbastecimentoSidebar;
AbastecimentoModule.defaultSection = 'equipamentos';