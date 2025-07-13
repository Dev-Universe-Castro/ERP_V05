
import React, { useState, useMemo } from 'react';
import { Search, Eye, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';

const AprovacoesTab = () => {
  const { data, updateItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const requisicoes = data.requisicoes || [];
  const cotacoes = data.cotacoes || [];

  const itensAprovacao = useMemo(() => {
    const requisicoesParaAprovacao = requisicoes
      .filter(r => r.status === 'pendente')
      .map(r => ({ ...r, tipo: 'requisicao' }));
    
    const cotacoesParaAprovacao = cotacoes
      .filter(c => c.status === 'pendente')
      .map(c => ({ ...c, tipo: 'cotacao' }));

    const todosItens = [...requisicoesParaAprovacao, ...cotacoesParaAprovacao];

    let filtered = todosItens.filter(item => {
      const searchFields = [item.numero, item.observacoes, item.solicitante];
      return searchFields.some(field => 
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.tipo === filterType);
    }

    return filtered;
  }, [requisicoes, cotacoes, searchTerm, filterType]);

  const handleAprovar = (item) => {
    const tipoPlural = item.tipo === 'requisicao' ? 'requisicoes' : 'cotacoes';
    
    updateItem(tipoPlural, item.id, {
      status: 'aprovada',
      aprovacao: {
        status: 'aprovada',
        aprovadoPor: 'Usuário Atual',
        dataAprovacao: new Date().toISOString(),
        observacoes: 'Aprovado via sistema'
      }
    });

    toast({
      title: `${item.tipo === 'requisicao' ? 'Requisição' : 'Cotação'} aprovada`,
      description: `${item.numero} aprovado com sucesso.`,
    });
  };

  const handleRejeitar = (item) => {
    const observacoes = prompt('Motivo da rejeição:');
    if (observacoes) {
      const tipoPlural = item.tipo === 'requisicao' ? 'requisicoes' : 'cotacoes';
      
      updateItem(tipoPlural, item.id, {
        status: 'rejeitada',
        aprovacao: {
          status: 'rejeitada',
          aprovadoPor: 'Usuário Atual',
          dataAprovacao: new Date().toISOString(),
          observacoes
        }
      });

      toast({
        title: `${item.tipo === 'requisicao' ? 'Requisição' : 'Cotação'} rejeitada`,
        description: `${item.numero} rejeitado com sucesso.`,
      });
    }
  };

  const getTipoBadge = (tipo) => {
    return tipo === 'requisicao' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Pesquisar itens para aprovação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">Todos os Tipos</option>
          <option value="requisicao">Requisições</option>
          <option value="cotacao">Cotações</option>
        </select>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {itensAprovacao.length}
              </div>
              <div className="text-sm text-gray-500">Total Pendente</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {itensAprovacao.filter(i => i.tipo === 'requisicao').length}
              </div>
              <div className="text-sm text-gray-500">Requisições</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {itensAprovacao.filter(i => i.tipo === 'cotacao').length}
              </div>
              <div className="text-sm text-gray-500">Cotações</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Tipo</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Número</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Solicitante</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Data</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Observações</th>
                  <th className="border-b px-4 py-3 text-center font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensAprovacao.map((item) => (
                  <tr key={`${item.tipo}-${item.id}`} className="hover:bg-gray-50">
                    <td className="border-b px-4 py-3">
                      <Badge variant={getTipoBadge(item.tipo)}>
                        {item.tipo === 'requisicao' ? 'Requisição' : 'Cotação'}
                      </Badge>
                    </td>
                    <td className="border-b px-4 py-3">{item.numero}</td>
                    <td className="border-b px-4 py-3">{item.solicitante || '-'}</td>
                    <td className="border-b px-4 py-3">
                      {new Date(item.dataRequisicao || item.dataEmissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="border-b px-4 py-3">
                      <div className="max-w-48 truncate">
                        {item.observacoes || '-'}
                      </div>
                    </td>
                    <td className="border-b px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => handleAprovar(item)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejeitar(item)}>
                          <X className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {itensAprovacao.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Nenhum item pendente</h3>
              <p>Não há requisições ou cotações aguardando aprovação no momento.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AprovacoesTab;
