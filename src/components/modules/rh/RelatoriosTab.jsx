
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, FileText, Download, Calendar, Users } from 'lucide-react';

const RelatoriosTab = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const relatorios = [
    {
      id: 'funcionarios-ativos',
      nome: 'Funcionários Ativos',
      descricao: 'Lista de todos os funcionários ativos',
      icon: Users
    },
    {
      id: 'folha-pagamento',
      nome: 'Folha de Pagamento',
      descricao: 'Relatório completo da folha de pagamento por período',
      icon: FileText
    },
    {
      id: 'ponto-frequencia',
      nome: 'Ponto e Frequência',
      descricao: 'Relatório de controle de ponto e frequência',
      icon: Calendar
    },
    {
      id: 'admissoes-demissoes',
      nome: 'Admissões e Demissões',
      descricao: 'Movimento de entrada e saída de funcionários',
      icon: BarChart3
    },
    {
      id: 'aniversariantes',
      nome: 'Aniversariantes do Mês',
      descricao: 'Lista de funcionários aniversariantes',
      icon: Users
    },
    {
      id: 'documentos-pendentes',
      nome: 'Documentos Pendentes',
      descricao: 'Funcionários com documentação incompleta',
      icon: FileText
    }
  ];

  const handleGenerateReport = () => {
    if (!selectedReport) return;
    
    console.log('Gerando relatório:', selectedReport, { startDate, endDate });
    // Aqui implementaria a lógica de geração do relatório
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Relatórios</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatorios.map((relatorio) => {
          const IconComponent = relatorio.icon;
          return (
            <Card 
              key={relatorio.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedReport === relatorio.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedReport(relatorio.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <IconComponent className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{relatorio.nome}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">{relatorio.descricao}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Relatório Selecionado:</label>
                <p className="text-sm text-gray-600">
                  {relatorios.find(r => r.id === selectedReport)?.nome}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data Inicial:</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data Final:</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Formato:</label>
                <Select defaultValue="pdf">
                  <SelectTrigger className="w-full md:w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  Pré-visualizar
                </Button>
                <Button onClick={handleGenerateReport} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { nome: 'Folha de Pagamento - Janeiro 2024', data: '2024-01-31', status: 'Concluído' },
              { nome: 'Funcionários Ativos', data: '2024-01-30', status: 'Concluído' },
              { nome: 'Ponto e Frequência - Janeiro', data: '2024-01-29', status: 'Concluído' }
            ].map((relatorio, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{relatorio.nome}</p>
                  <p className="text-xs text-gray-600">Gerado em {new Date(relatorio.data).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {relatorio.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatoriosTab;
