
import React, { useState, useMemo } from 'react';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import CotacaoModal from './CotacaoModal';

const CotacoesTab = ({ showModal, setShowModal, modalType, setModalType, selectedItem, setSelectedItem }) => {
  const { data, addItem, updateItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const cotacoes = data.cotacoes || [];
  const requisicoes = data.requisicoes || [];

  const filteredCotacoes = useMemo(() => {
    let filtered = cotacoes.filter(item => {
      const searchFields = [item.numero, item.observacoes];
      return searchFields.some(field => 
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    return filtered;
  }, [cotacoes, searchTerm, filterStatus]);

  const handleNovaCotacao = () => {
    setModalType('cotacao');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEditCotacao = (cotacao) => {
    setModalType('cotacao');
    setSelectedItem(cotacao);
    setShowModal(true);
  };

  const handleDeleteCotacao = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta cotação?')) {
      deleteItem('cotacoes', id);
      toast({
        title: "Cotação excluída",
        description: "Cotação excluída com sucesso.",
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'pendente': 'secondary',
      'aprovada': 'default',
      'rejeitada': 'destructive',
      'em-analise': 'outline'
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Pesquisar cotações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="aprovada">Aprovada</option>
          <option value="em-analise">Em Análise</option>
          <option value="rejeitada">Rejeitada</option>
        </select>

        <Button onClick={handleNovaCotacao}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Cotação
        </Button>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Número</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Requisição</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Data Emissão</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Vencimento</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Valor Total</th>
                  <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="border-b px-4 py-3 text-center font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCotacoes.map((cotacao) => {
                  const requisicao = requisicoes.find(r => r.id === cotacao.requisicaoId);
                  return (
                    <tr key={cotacao.id} className="hover:bg-gray-50">
                      <td className="border-b px-4 py-3">{cotacao.numero}</td>
                      <td className="border-b px-4 py-3">{requisicao?.numero || '-'}</td>
                      <td className="border-b px-4 py-3">
                        {new Date(cotacao.dataEmissao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="border-b px-4 py-3">
                        {new Date(cotacao.dataVencimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="border-b px-4 py-3">
                        R$ {(cotacao.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border-b px-4 py-3">
                        <Badge variant={getStatusBadge(cotacao.status)}>
                          {cotacao.status}
                        </Badge>
                      </td>
                      <td className="border-b px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditCotacao(cotacao)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteCotacao(cotacao.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && modalType === 'cotacao' && (
        <CotacaoModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedItem(null);
          }}
          cotacao={selectedItem}
        />
      )}
    </div>
  );
};

export default CotacoesTab;
